// Feito por Sophia :)

import { getConn } from '../../config/db';

/**
 * Interface para os dados necessários na criação de uma turma.
 */
interface CriarTurma {
  nome: string;
  codigo?: string;
  apelido?: string;
  idInstituicao: number;
  idDisciplina: number;
  docenteId: string;
}

/**
 * Interface para os dados necessários na atualização de uma turma.
 */
interface AtualizarTurma {
  id: number;
  nome?: string;
  codigo?: string;
  apelido?: string;
  docenteId: string;
}

/**
 * Serviço de Turmas: contém a lógica de negócios para criar, listar, atualizar e deletar turmas.
 */
export class TurmasService {

  /**
   * Cria uma nova turma no banco de dados.
   * Realiza validações para garantir que o docente é proprietário da instituição e da disciplina.
   * @param {CriarTurma} data - Dados da turma a ser criada.
   * @returns {Promise<object>} Os dados da turma criada.
   * @throws {Error} Se o docente não tiver permissão para a instituição ou disciplina.
   */
  async criar({ nome, codigo, apelido, idInstituicao, idDisciplina, docenteId }: CriarTurma) {
    let connection;
    try {
      connection = await getConn();
      const docenteIdNum = Number(docenteId);

      // 1. Verifica se o docente é proprietário da INSTITUIÇÃO.
      const checkInstSql = `
        SELECT 1 FROM INSTITUICAO 
        WHERE ID_INSTITUICAO = :idInstituicao AND FK_ID_DOCENTE = :docenteIdNum
      `;
      const instResult = await connection.execute(checkInstSql, { idInstituicao, docenteIdNum });
      if (!instResult.rows || instResult.rows.length === 0) {
        throw new Error("Permissão negada. A instituição não pertence a este docente.");
      }
      
      // 2. Verifica se o docente é proprietário da DISCIPLINA.
      const checkDiscSql = `
        SELECT 1 FROM DISCIPLINA
        WHERE ID_DISCIPLINA = :idDisciplina AND FK_ID_DOCENTE = :docenteIdNum
      `;
      const discResult = await connection.execute(checkDiscSql, { idDisciplina, docenteIdNum });
      if (!discResult.rows || discResult.rows.length === 0) {
        throw new Error("Permissão negada. A disciplina não pertence a este docente.");
      }

      // 3. Insere a nova turma no banco de dados.
      const sql = `
        INSERT INTO TURMA (NOME, CODIGO, APELIDO, FK_ID_DISCIPLINA, FK_ID_INSTITUICAO)
        VALUES (:nome, :codigo, :apelido, :idDisciplina, :idInstituicao)
      `;
      
      await connection.execute(sql, 
        { 
          nome: nome,
          codigo: codigo || null,
          apelido: apelido || null,
          idDisciplina: idDisciplina,
          idInstituicao: idInstituicao
        },
        { autoCommit: true }
      );
      
      return { nome, codigo, apelido, idDisciplina, idInstituicao };
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }

  /**
   * Lista as turmas de uma instituição específica, garantindo que a instituição pertence ao docente.
   * @param {number} idInstituicao - O ID da instituição.
   * @param {string} docenteId - O ID do docente autenticado.
   * @returns {Promise<Array>} Uma lista de turmas.
   */
  async listarPorInstituicao(idInstituicao: number, docenteId: string) {
    let connection;
    try {
      connection = await getConn();
      
      // Busca turmas que pertencem à instituição e onde a instituição pertence ao docente.
      const sql = `
        SELECT 
          t.ID_TURMA, 
          t.NOME, 
          t.CODIGO, 
          t.APELIDO, 
          t.FK_ID_INSTITUICAO,
          t.FK_ID_DISCIPLINA,
          d.NOME AS NOME_DISCIPLINA
        FROM TURMA t
        JOIN DISCIPLINA d ON t.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
        JOIN INSTITUICAO i ON t.FK_ID_INSTITUICAO = i.ID_INSTITUICAO
        WHERE t.FK_ID_INSTITUICAO = :idInstituicao 
          AND i.FK_ID_DOCENTE = :docenteIdNum
      `;
      const result = await connection.execute(sql, { idInstituicao, docenteIdNum: Number(docenteId) });
      return result.rows || []; 
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }

  /**
   * Atualiza os dados de uma turma existente.
   * Garante que apenas o docente proprietário da instituição à qual a turma pertence possa atualizar.
   * @param {AtualizarTurma} data - Dados da turma a ser atualizada.
   * @returns {Promise<object>} Os dados atualizados da turma.
   * @throws {Error} Se a turma não for encontrada ou não pertencer ao docente.
   */
  async atualizar({ id, nome, codigo, apelido, docenteId }: AtualizarTurma) {
    let connection;
    try {
      connection = await getConn();
      
      // Atualiza a turma, verificando a propriedade do docente sobre a instituição.
      const sql = `
        UPDATE TURMA t
        SET 
          NOME = :nome,
          CODIGO = :codigo,
          APELIDO = :apelido
        WHERE t.ID_TURMA = :id
          AND EXISTS (
            SELECT 1 FROM INSTITUICAO i
            WHERE i.ID_INSTITUICAO = t.FK_ID_INSTITUICAO AND i.FK_ID_DOCENTE = :docenteIdNum
          )
      `;
      
      const result = await connection.execute(
        sql, 
        { 
          nome: nome || null,
          codigo: codigo || null,
          apelido: apelido || null,
          id: id, 
          docenteIdNum: Number(docenteId) 
        }, 
        { autoCommit: true }
      );
      
      if (result.rowsAffected === 0) {
        throw new Error("Turma não encontrada ou não pertence a este docente.");
      }
      return { id, nome, codigo, apelido };
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }

  /**
   * Deleta uma turma do banco de dados.
   * Garante que apenas o docente proprietário da instituição possa deletar a turma e verifica dependências.
   * @param {number} id - O ID da turma a ser deletada.
   * @param {string} docenteId - O ID do docente autenticado.
   * @returns {Promise<object>} Mensagem de sucesso.
   * @throws {Error} Se a turma não for encontrada, não pertencer ao docente ou tiver alunos inscritos.
   */
  async deletar(id: number, docenteId: string) {
    let connection;
    try {
      connection = await getConn();
      
      // Deleta a turma, verificando a propriedade do docente sobre a instituição.
      const sql = `
        DELETE FROM TURMA t
        WHERE t.ID_TURMA = :id
          AND EXISTS (
            SELECT 1 FROM INSTITUICAO i
            WHERE i.ID_INSTITUICAO = t.FK_ID_INSTITUICAO AND i.FK_ID_DOCENTE = :docenteIdNum
          )
      `;
      
      const result = await connection.execute(
        sql, 
        { id, docenteIdNum: Number(docenteId) }, 
        { autoCommit: true }
      );
      
      if (result.rowsAffected === 0) {
        throw new Error("Turma não encontrada ou não pertence a este docente.");
      }
      return { message: "Deletado com sucesso" };
    } catch (error: any) {
      // ORA-02292: child record found (ex: uma INSCRICAO depende desta turma)
      if (error.errorNum === 2292) {
        throw new Error("Não é possível deletar. Esta turma já possui alunos inscritos.");
      }
      console.error(error);
      throw error;
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }

  /**
   * Lista todas as turmas associadas a um docente específico, incluindo o nome da disciplina.
   * @param {string} docenteId - O ID do docente.
   * @returns {Promise<Array>} Uma lista de turmas com informações da disciplina.
   */
  async listarPorDocente(docenteId: string) {
    let connection;
    try {
      connection = await getConn();
      const sql = `
        SELECT 
          t.ID_TURMA, 
          t.NOME, 
          t.CODIGO, 
          t.APELIDO, 
          t.FK_ID_INSTITUICAO,
          t.FK_ID_DISCIPLINA,
          d.NOME AS NOME_DISCIPLINA
        FROM TURMA t
        JOIN DISCIPLINA d ON t.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
        JOIN INSTITUICAO i ON t.FK_ID_INSTITUICAO = i.ID_INSTITUICAO
        WHERE i.FK_ID_DOCENTE = :docenteIdNum
      `;
      const result = await connection.execute(sql, { docenteIdNum: Number(docenteId) });
      return result.rows || [];
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }
}
