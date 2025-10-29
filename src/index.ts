import express, {Request, Response} from "express";
import cors from "cors";
import "dotenv/config";
import { initPool, getConn, closePool } from "./db";

interface Aluno {
  nome: string;
  idade: number;
  ra: number;
}

const app = express();  
app.use(express.json());
app.use(cors());

/**
 * BOOT/SHUTDOWN DO SERVIDOR COM O POOL DO ORACLE
 * ------------------------------------------------
 * Por que fazer assim?
 * 1) Garantimos que o pool de conexões (oracledb.createPool) está criado ANTES de
 *    começar a receber requisições — evitando falhas de "pool not available".
 * 2) No encerramento (SIGINT/SIGTERM), fechamos o pool de forma limpa, devolvendo
 *    as conexões ao Oracle (boa prática em apps com DB).
 */
const PORT = Number(process.env.PORT ?? 3000);
(async () => {
  try {
    await initPool(); //cria/reutiliza o pool de conexões ao Oracle
    app.listen(PORT, () => console.log(`Servidor ativo na porta ${PORT}`));
    process.on("SIGINT", async () => { await closePool(); process.exit(0); });
    process.on("SIGTERM", async () => { await closePool(); process.exit(0); });
  } catch (err) {
    console.error("Falha ao iniciar:", err);
    process.exit(1);
  }
})();

app.get("/", (req: Request, res: Response) => {
  return res.status(200).send("Hello World!!! teste");
});

/**
 * GET /alunos
 * -----------
 * Banco de dados (pontos didáticos):
 * - Usamos SELECT com *aliases entre aspas* (AS "ra"...). No Oracle, isso faz o
 *   driver devolver as chaves do objeto exatamente em minúsculas, alinhando com o front.
 * - Sempre feche a conexão após usar (conn.close()). Como estamos usando pool,
 *   isso devolve a conexão ao pool, não "derruba" no banco.
 */
app.get("/alunos", async (req: Request, res: Response) => {
  try {
    const conn = await getConn(); // pega uma conexão do pool
    const result = await conn.execute(
       `SELECT ra AS "ra", nome AS "nome", idade AS "idade" FROM alunosPuc ORDER BY ra`
       // Dica: criar um INDEX em alunosPuc(ra) ajuda no ORDER BY e buscas por RA.
    );
    await conn.close(); //devolve ao pool
    return res.status(200).send(result.rows ?? []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao listar alunos." });
  }
});

/**
 * GET /alunos/:ra
 * ---------------
 * Banco de dados (pontos didáticos):
 * - Bind variable (:ra) → evita SQL Injection e reaproveita plano de execução
 *   (parsing mais eficiente no Oracle).
 * - Como esperamos 0 ou 1 registro por RA (chave primária), pegamos o primeiro.
 */
app.get("/alunos/:ra", async (req:Request, res: Response) => {
  let ra = Number(req.params.ra);
  if (Number.isNaN(ra)) {
    return res.status(400).json({ message: "RA inválido." });
  }
  try {
    const conn = await getConn();
    const result = await conn.execute(
      `SELECT ra as "ra", nome as "nome", idade as "idade" FROM alunosPuc WHERE ra = :ra`,
      { ra } //bind variable
    );
    await conn.close();

    const aluno = (result.rows ?? [])[0] as Aluno | undefined;
    if (!aluno) return res.status(404).json({ message: "Aluno não encontrado." });
    return res.status(200).send(aluno);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao obter aluno." });
  }
});

/**
 * POST /alunos
 * ------------
 * Banco de dados (pontos didáticos):
 * - Primeiro checamos duplicidade de RA via SELECT (padrão didático).
 *   Alternativa "real": criar CONSTRAINT UNIQUE(PK) e capturar ORA-00001.
 * - { autoCommit: true } em inserts simples é OK. Para múltiplas operações
 *   relacionadas, prefira transação explícita (commit/rollback manual).
 */
app.post("/alunos", async (req: Request, res: Response) => {
  const { ra, nome, idade } = req.body as Partial<Aluno>;

  // validações básicas no app (antes de chegar ao DB)
  if (typeof ra !== "number" || typeof nome !== "string" || typeof idade !== "number") {
    return res
      .status(400)
      .json({ message: "Campos obrigatórios: ra(number), nome(string), idade(number)." });
  }

  try {
    const conn = await getConn();

    //Checagem de existência (pode ser trocada por constraint + try/catch ORA-00001)
    const exists = await conn.execute(`SELECT 1 FROM alunosPuc WHERE ra = :ra`, { ra });
    if (exists.rows && exists.rows.length > 0) {
      await conn.close();
      return res.status(409).json({ message: "RA já cadastrado." });
    }

    //INSERT com bind variables — seguro e performático
    await conn.execute(
      `INSERT INTO alunosPuc (ra, nome, idade) VALUES (:ra, :nome, :idade)`,
      { ra, nome, idade },
      { autoCommit: true } //commit automático porque é uma única operação
    );
    await conn.close();
    return res.status(201).send({ message: "Aluno cadastrado com sucesso" });
  } catch (err) {
    console.error(err);
    // Dica: se usar constraint UNIQUE/PK e retirar o SELECT acima, trate ORA-00001 aqui.
    return res.status(500).json({ message: "Erro ao criar aluno." });
  }
})

/**
 * PUT /alunos/:ra
 * ---------------
 * Banco de dados (pontos didáticos):
 * - UPDATE com binds.
 * - Checamos result.rowsAffected para saber se o RA existia.
 * - { autoCommit: true } como no INSERT.
 */
app.put("/alunos/:ra", async (req:Request, res: Response) => {
  const ra = Number(req.params.ra);
  if (Number.isNaN(ra)) {
    return res.status(400).json({ message: "RA inválido." });
  }
  const { nome, idade } = req.body as Partial<Aluno>;
  if (typeof nome !== "string" || typeof idade !== "number") {
    return res.status(400).json({ message: "Campos obrigatórios: nome(string), idade(number)." });
  }

  try {
    const conn = await getConn();
    const result = await conn.execute(
      `UPDATE alunosPuc SET nome = :nome, idade = :idade WHERE ra = :ra`,
      { nome, idade, ra }, //binds
      { autoCommit: true } //commit automático
    );
    await conn.close();

    // Oracle retorna rowsAffected; se 0, não encontrou o RA
    if (!result.rowsAffected) return res.status(404).json({ message: "Aluno não encontrado." });
    return res.status(200).send({ message: "Aluno alterado com sucesso!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao alterar aluno." });
  }
}); 

/**
 * DELETE /alunos/:ra
 * ------------------
 * Banco de dados (pontos didáticos):
 * - DELETE com bind.
 * - Conferimos rowsAffected.
 * - Observação: o comentário acima dizia "(PUT)", mas o método correto é DELETE.
 */
app.delete("/alunos/:ra", async (req:Request, res: Response) => {
  const ra = Number(req.params.ra);
  if (Number.isNaN(ra)) {
    return res.status(400).json({ message: "RA inválido." });
  }
  try {
    const conn = await getConn();
    const result = await conn.execute(
      `DELETE FROM alunosPuc WHERE ra = :ra`,
      { ra },             // bind evita SQL injection
      { autoCommit: true } // commit automático no delete simples
    );
    await conn.close();

    if (!result.rowsAffected) return res.status(404).json({ message: "Aluno não encontrado." });
    return res.send({ message: "Aluno removido com sucesso!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao remover aluno." });
  }
});
