// Feito por Sophia :)

import { getConn } from '../../config/db'; 

/**
 * Interface para um item de nota a ser lançado ou atualizado em lote.
 */
interface NotaLoteItem {
  idInscricao: number;
  idComponente: number;
  valorNota: number | null;
}

/**
 * Serviço de Notas: contém a lógica de negócios para listar componentes de nota,
 * montar a grade de notas de uma turma e lançar/atualizar notas em lote.
 */
export class NotasService {
  /**
   * Busca os componentes de nota (e.g., P1, P2, Trabalho) de uma disciplina específica.
   * Garante que a disciplina pertence ao docente autenticado.
   * @param {number} idDisciplina - O ID da disciplina.
   * @param {string} docenteId - O ID do docente autenticado.
   * @returns {Promise<Array>} Uma lista de componentes de nota.
   */
  async listarComponentesPorDisciplina(idDisciplina: number, docenteId: string) {
    let connection;
    try {
      connection = await getConn();
      const sql = `
        SELECT c.ID_COMPONENTE, c.NOME, c.SIGLA, c.PESO
        FROM COMPONENTE_NOTA c
        JOIN DISCIPLINA d ON c.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
        WHERE c.FK_ID_DISCIPLINA = :idDisciplina
          AND d.FK_ID_DOCENTE = :docenteId
        ORDER BY c.ID_COMPONENTE
      `;
      const result = await connection.execute(sql, { idDisciplina, docenteId: Number(docenteId) });
      return result.rows || [];
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }

  /**
   * Monta a grade de notas de uma turma, incluindo todos os alunos inscritos e suas notas existentes.
   * Valida a permissão do docente para acessar a turma.
   * @param {number} idTurma - O ID da turma.
   * @param {string} docenteId - O ID do docente autenticado.
   * @returns {Promise<Array>} Uma estrutura de dados com alunos e suas notas.
   * @throws {Error} Se a permissão for negada ou a turma não for encontrada.
   */
  async listarNotasGridPorTurma(idTurma: number, docenteId: string) {
    let connection;
    try {
      connection = await getConn();
      
      // Valida permissão do docente para a turma.
      const checkSql = `
        SELECT 1 FROM TURMA t
        JOIN DISCIPLINA d ON t.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
        WHERE t.ID_TURMA = :idTurma AND d.FK_ID_DOCENTE = :docenteId
      `;
      const checkResult = await connection.execute(checkSql, { idTurma, docenteId: Number(docenteId) });
      if (!checkResult.rows || checkResult.rows.length === 0) {
        throw new Error("Permissão negada ou turma não encontrada.");
      }
      
      // Busca todos os alunos inscritos na turma e suas notas (se existirem).
      const sql = `
        SELECT
            i.ID_INSCRICAO,
            a.NOME_COMPLETO,
            a.MATRICULA,
            n.FK_ID_COMPONENTE,
            n.VALOR_NOTA
        FROM INSCRICAO i
        JOIN ALUNO a ON i.FK_ID_ALUNO = a.ID_ALUNO
        LEFT JOIN NOTA n ON i.ID_INSCRICAO = n.FK_ID_INSCRICAO
        WHERE i.FK_ID_TURMA = :idTurma
        ORDER BY a.NOME_COMPLETO
      `;
      const result = await connection.execute(sql, { idTurma });
      
      // Transforma as linhas do banco em um formato mais amigável para o frontend.
      const gridData: any = {};
      (result.rows as any[]).forEach(row => {
        if (!gridData[row.ID_INSCRICAO]) {
          gridData[row.ID_INSCRICAO] = {
            idInscricao: row.ID_INSCRICAO,
            nomeCompleto: row.NOME_COMPLETO,
            matricula: row.MATRICULA,
            notas: {} 
          };
        }
        if (row.FK_ID_COMPONENTE !== null) {
          gridData[row.ID_INSCRICAO].notas[row.FK_ID_COMPONENTE] = row.VALOR_NOTA;
        }
      });

      return Object.values(gridData);
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }

  /**
   * Lança ou atualiza notas em lote.
   * Utiliza a operação MERGE do Oracle para inserir novas notas ou atualizar existentes.
   * Garante que as inscrições pertencem ao docente autenticado.
   * @param {NotaLoteItem[]} notas - Um array de objetos de nota a serem salvos.
   * @param {string} docenteId - O ID do docente autenticado.
   * @returns {Promise<object>} Mensagem de sucesso.
   * @throws {Error} Se a permissão for negada para alguma inscrição.
   */
  async lancarOuAtualizarLote(notas: NotaLoteItem[], docenteId: string) {
    let connection;
    try {
      connection = await getConn();
      
      const idsInscricao = [...new Set(notas.map(n => n.idInscricao))];
      if (idsInscricao.length === 0) return { message: "Nenhuma nota para salvar." };

      // Constrói binds de forma segura para a cláusula IN.
      const bindObj: any = { docenteId: Number(docenteId) };
      const bindNames = idsInscricao.map((id, i) => {
          const key = `b${i}`;
          bindObj[key] = id;
          return `:${key}`;
      }).join(',');

      // Verifica se todas as inscrições pertencem ao docente.
      const checkSql = `
        SELECT i.ID_INSCRICAO FROM INSCRICAO i
        JOIN TURMA t ON i.FK_ID_TURMA = t.ID_TURMA
        JOIN DISCIPLINA d ON t.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
        WHERE i.ID_INSCRICAO IN (${bindNames}) AND d.FK_ID_DOCENTE = :docenteId
      `;
      
      const checkResult = await connection.execute(checkSql, bindObj);
      const idsValidos = new Set((checkResult.rows as any[]).map(r => r.ID_INSCRICAO));
      
      if (idsValidos.size !== idsInscricao.length) {
          throw new Error("Permissão negada. Algumas inscrições não pertencem a este docente.");
      }

      // Utiliza MERGE para inserir ou atualizar notas.
      const sql = `
        MERGE INTO NOTA n
        USING (
            SELECT :idInscricao AS FK_ID_INSCRICAO, :idComponente AS FK_ID_COMPONENTE FROM dual
        ) src ON (n.FK_ID_INSCRICAO = src.FK_ID_INSCRICAO AND n.FK_ID_COMPONENTE = src.FK_ID_COMPONENTE)
        WHEN MATCHED THEN
            UPDATE SET n.VALOR_NOTA = :valorNota
        WHEN NOT MATCHED THEN
            INSERT (FK_ID_INSCRICAO, FK_ID_COMPONENTE, VALOR_NOTA)
            VALUES (:idInscricao, :idComponente, :valorNota)
      `;
      
      const bindsMany = notas.map(nota => ({
        idInscricao: nota.idInscricao,
        idComponente: nota.idComponente,
        valorNota: nota.valorNota
      }));

      await connection.executeMany(sql, bindsMany, { autoCommit: true });

      return { message: `${notas.length} notas salvas com sucesso.` };
    } catch (error) {
      console.error("Erro ao salvar notas:", error);
      throw error;
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }

  /**
   * Gera o conteúdo CSV para exportação
   */
  async exportarCsv(idTurma: number, docenteId: string) {
    // Busca os dados (Alunos e Notas)
    const grade = await this.listarNotasGridPorTurma(idTurma, docenteId);
    
    // 2. Busca a disciplina (Necessário para saber os componentes P1, P2...)
    let connection;
    let componentes: any[] = [];
    try {
        connection = await getConn();
        
        // Busca a turma e verifica se pertence ao docente (via disciplina)
        const sqlDisc = `
            SELECT t.FK_ID_DISCIPLINA 
            FROM TURMA t
            JOIN DISCIPLINA d ON t.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
            WHERE t.ID_TURMA = :idTurma AND d.FK_ID_DOCENTE = :docenteId
        `;
        const resDisc = await connection.execute(sqlDisc, { idTurma, docenteId: Number(docenteId) });
        
        // --- PROTEÇÃO CONTRA ERRO ---
        if (!resDisc.rows || resDisc.rows.length === 0) {
            throw new Error("Turma não encontrada ou você não tem permissão para acessá-la.");
        }
        
        const idDisciplina = (resDisc.rows[0] as any).FK_ID_DISCIPLINA;
        
        // Busca os componentes (P1, P2) dessa disciplina
        componentes = await this.listarComponentesPorDisciplina(idDisciplina, docenteId);
        
    } finally {
        if(connection) try { await connection.close(); } catch(e){}
    }

    // 3. Monta o Cabeçalho do CSV
    let csv = 'Nome do Aluno,Matricula';
    
    let somaPesos = 0;
    componentes.forEach(c => {
        csv += `,${c.SIGLA} (Peso ${c.PESO})`;
        somaPesos += parseFloat(c.PESO);
    });
    csv += ',Nota Final\n'; 

    // 4. Monta as Linhas
    grade.forEach((aluno: any) => {
        // Aspas para evitar quebrar o CSV se o nome tiver vírgula
        csv += `"${aluno.nomeCompleto}","${aluno.matricula}"`;

        let somaPonderada = 0;

        componentes.forEach(c => {
            const nota = aluno.notas[c.ID_COMPONENTE];
            const valor = nota !== undefined && nota !== null ? parseFloat(nota) : 0;
            
            csv += `,${valor.toFixed(2).replace('.', ',')}`; // Formata para PT-BR (virgula decimal) se quiser, ou mantenha ponto
            
            somaPonderada += (valor * parseFloat(c.PESO));
        });

        // Calcula a Nota Final
        const notaFinal = somaPesos > 0 ? (somaPonderada / somaPesos) : 0;
        csv += `,${notaFinal.toFixed(2).replace('.', ',')}\n`;
    });

    return csv;
  }
}
