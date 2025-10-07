import express, { Request, Response } from 'express';
import cors from 'cors';
import oracledb from 'oracledb';

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  user: 'SEU_USUARIO',
  password: 'SUA_SENHA',
  connectString: 'localhost/XEPDB1' // Ajuste conforme seu Oracle
};

async function runQuery(query: string, params: any[] = []) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(query, params, { autoCommit: true });
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

app.post('/usuarios', async (req: Request, res: Response) => {
  const { nome, email } = req.body;
  try {
    const sql = `INSERT INTO usuarios (nome, email) VALUES (:nome, :email)`;
    await runQuery(sql, [nome, email]);
    res.json({ message: 'Usuário cadastrado!' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/usuarios', async (req: Request, res: Response) => {
  try {
    const result = await runQuery('SELECT * FROM usuarios');
    res.json(result.rows?.map(row => ({
      id: row[0],
      nome: row[1],
      email: row[2]
    })));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
