// Feito por Sophia :)

import { getConn } from '../../config/db';

/**
 * Interface para os dados necessários na criação de uma disciplina.
 */
interface CriarDisciplina {
  nome: string;
  sigla?: string;
  codigo?: string;
  periodo_curso?: string;
  docenteId: string;
}

/**
 * Interface para os dados necessários na atualização de uma disciplina.
 */
interface AtualizarDisciplina {
  id: number;
  nome?: string;
  sigla?: string;
  codigo?: string;
  periodo_curso?: string;
  docenteId: string;
}

/**
 * Serviço de Disciplinas: contém a lógica de negócios para criar, listar, atualizar e deletar disciplinas.
 */
export class DisciplinasService {

  /**
   * Cria uma nova disciplina no banco de dados.
   * Associa a disciplina ao docente autenticado.
   * @param {CriarDisciplina} data - Dados da disciplina a ser criada.
   * @returns {Promise<object>} Os dados da disciplina criada.
   */
  async criar({ nome, sigla, codigo, periodo_curso, docenteId }: CriarDisciplina) {
    let connection;
    try {
      connection = await getConn();
      
      // Insere a nova disciplina com o ID do docente associado.
      const sql = `
        INSERT INTO DISCIPLINA (NOME, SIGLA, CODIGO, PERIODO_CURSO, FK_ID_DOCENTE)
        VALUES (:nome, :sigla, :codigo, :periodo_curso, :docenteId)
      `;
      
      await connection.execute(sql, 
        { 
          nome: nome,
          sigla: sigla || null,
          codigo: codigo || null,
          periodo_curso: periodo_curso || null,
          docenteId: Number(docenteId)
        },
        { autoCommit: true }
      );
      
      return { nome, sigla, codigo, periodo_curso };
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
   * Lista todas as disciplinas associadas a um docente específico.
   * @param {string} docenteId - O ID do docente.
   * @returns {Promise<Array>} Uma lista de disciplinas.
   */
  async listar(docenteId: string) {
    let connection;
    try {
      connection = await getConn();
      
      // Busca todas as disciplinas pertencentes ao docente.
      const sql = `
        SELECT ID_DISCIPLINA, NOME, SIGLA, CODIGO, PERIODO_CURSO
        FROM DISCIPLINA
        WHERE FK_ID_DOCENTE = :docenteIdNum
        ORDER BY NOME
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
  
  /**
   * Atualiza os dados de uma disciplina existente.
   * Garante que apenas o docente proprietário possa atualizar a disciplina.
   * @param {AtualizarDisciplina} data - Dados da disciplina a ser atualizada.
   * @returns {Promise<object>} Os dados atualizados da disciplina.
   * @throws {Error} Se a disciplina não for encontrada ou não pertencer ao docente.
   */
  async atualizar({ id, nome, sigla, codigo, periodo_curso, docenteId }: AtualizarDisciplina) {
    let connection;
    try {
      connection = await getConn();
      
      // Atualiza a disciplina, verificando se pertence ao docente.
      const sql = `
        UPDATE DISCIPLINA
        SET 
          NOME = :nome,
          SIGLA = :sigla,
          CODIGO = :codigo,
          PERIODO_CURSO = :periodo_curso
        WHERE ID_DISCIPLINA = :id AND FK_ID_DOCENTE = :docenteIdNum
      `;
      
      const result = await connection.execute(
        sql, 
        { 
          nome: nome,
          sigla: sigla || null,
          codigo: codigo || null,
          periodo_curso: periodo_curso || null,
          id: id, 
          docenteIdNum: Number(docenteId) 
        }, 
        { autoCommit: true }
      );
      
      if (result.rowsAffected === 0) {
        throw new Error("Disciplina não encontrada ou não pertence a este docente.");
      }
      return { id, nome, sigla, codigo, periodo_curso };
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
   * Deleta uma disciplina do banco de dados.
   * Garante que apenas o docente proprietário possa deletar a disciplina e verifica se há turmas associadas.
   * @param {number} id - O ID da disciplina a ser deletada.
   * @param {string} docenteId - O ID do docente.
   * @returns {Promise<object>} Mensagem de sucesso.
   * @throws {Error} Se a disciplina não for encontrada, não pertencer ao docente ou tiver turmas associadas.
   */
  async deletar(id: number, docenteId: string) {
    let connection;
    try {
      connection = await getConn();
      
      // Deleta a disciplina, verificando se pertence ao docente.
      const sql = `
        DELETE FROM DISCIPLINA
        WHERE ID_DISCIPLINA = :id AND FK_ID_DOCENTE = :docenteIdNum
      `;
      
      const result = await connection.execute(
        sql, 
        { id, docenteIdNum: Number(docenteId) }, 
        { autoCommit: true }
      );
      
      if (result.rowsAffected === 0) {
        throw new Error("Disciplina não encontrada ou não pertence a este docente.");
      }
      return { message: "Deletado com sucesso" };
    } catch (error: any) {
      // ORA-02292: child record found (ex: uma TURMA depende desta disciplina)
      if (error.errorNum === 2292) {
        throw new Error("Não é possível deletar. Esta disciplina já possui turmas cadastradas.");
      }
      console.error(error);
      throw error;
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }
}
