// Feito por Sophia :)

import { getConn } from '../../config/db';

/**
 * Interface para os dados necessários na criação de uma instituição.
 */
interface CriarInstituicao {
  nome: string;
  local?: string; 
  docenteId: string;
}

/**
 * Interface para os dados necessários na exclusão de uma instituição.
 */
interface DeletarInstituicao {
  id: number;
  docenteId: string;
}

/**
 * Serviço de Instituições: contém a lógica de negócios para criar, listar e deletar instituições.
 */
export class InstituicoesService {

  /**
   * Cria uma nova instituição no banco de dados.
   * Associa a instituição ao docente autenticado.
   * @param {CriarInstituicao} data - Dados da instituição a ser criada.
   * @returns {Promise<object>} Os dados da instituição criada.
   */
  async criar({ nome, local, docenteId }: CriarInstituicao) {
    let connection;
    try {
      connection = await getConn();
      
      const sql = `
        INSERT INTO INSTITUICAO (NOME, LOCAL, FK_ID_DOCENTE)
        VALUES (:nome, :local, :docenteId)
      `;
      
      await connection.execute(sql, 
        { 
          nome, 
          local: local || null,
          docenteId: Number(docenteId)
        }, 
        { autoCommit: true }
      );
      
      return { nome, local, docenteId }; 
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
   * Lista todas as instituições associadas a um docente específico.
   * @param {string} docenteId - O ID do docente.
   * @returns {Promise<Array>} Uma lista de instituições.
   */
  async listar(docenteId: string) {
    let connection;
    try {
      connection = await getConn();
      
      const sql = `
        SELECT ID_INSTITUICAO, NOME, LOCAL 
        FROM INSTITUICAO 
        WHERE FK_ID_DOCENTE = :docenteId
        ORDER BY NOME
      `;
      const result = await connection.execute(sql, { docenteId: Number(docenteId) });
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
   * Deleta uma instituição do banco de dados.
   * Garante que apenas o docente proprietário possa deletar a instituição e verifica se há dependências.
   * @param {DeletarInstituicao} data - O ID da instituição a ser deletada e o ID do docente.
   * @returns {Promise<object>} Mensagem de sucesso.
   * @throws {Error} Se a instituição não for encontrada, não pertencer ao docente ou tiver dependências (turmas/alunos).
   */
  async deletar({ id, docenteId }: DeletarInstituicao) {
    let connection;
    try {
      connection = await getConn();
      const sql = `
        DELETE FROM INSTITUICAO 
        WHERE ID_INSTITUICAO = :id AND FK_ID_DOCENTE = :docenteId
      `;
      
      const result = await connection.execute(
        sql, 
        { id, docenteId: Number(docenteId) }, 
        { autoCommit: true }
      );
      
      if (result.rowsAffected === 0) {
        throw new Error("Instituição não encontrada ou não pertence a este docente.");
      }
      
      return { message: "Deletado com sucesso" };

    } catch (error: any) { 
      if (error.errorNum === 2292) {
        throw new Error("Não é possível deletar. Esta instituição já possui turmas ou alunos cadastrados. Por favor, remova-os primeiro.");
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
