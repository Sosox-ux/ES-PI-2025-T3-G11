import { getConn } from '../../config/db';

interface CriarInstituicao {
  nome: string;
  docenteId: string;
}
interface AtualizarInstituicao {
  id: number;
  nome: string;
  docenteId: string;
}
interface DeletarInstituicao {
  id: number;
  docenteId: string;
}

export class InstituicoesService {

  /**
   * CREATE (SQL INSERT)
   */
  async criar({ nome, docenteId }: CriarInstituicao) {
    let connection;
    try {
      connection = await getConn();
      const sql = `
        INSERT INTO INSTITUICAO (NOME, FK_ID_DOCENTE)
        VALUES (:nome, :docenteId)
      `;
      
      await connection.execute(sql, 
        { nome, docenteId: Number(docenteId) }, // Garante que o ID é número
        { autoCommit: true }
      );
      
      // (O ideal seria retornar o ID que o Oracle gerou, 
      //  mas isso é mais complexo. Vamos manter simples.)
      return { nome, docenteId }; 
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
   * READ (SQL SELECT)
   */
  async listar(docenteId: string) {
    let connection;
    try {
      connection = await getConn();
      const sql = `
        SELECT ID_INSTITUICAO, NOME 
        FROM INSTITUICAO 
        WHERE FK_ID_DOCENTE = :docenteId
        ORDER BY NOME
      `;
      const result = await connection.execute(sql, { docenteId: Number(docenteId) });
      
      // Retorna a lista de linhas (objetos) que o Oracle encontrou
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
   * UPDATE (SQL UPDATE)
   */
  async atualizar({ id, nome, docenteId }: AtualizarInstituicao) {
    let connection;
    try {
      connection = await getConn();
      const sql = `
        UPDATE INSTITUICAO 
        SET NOME = :nome 
        WHERE ID_INSTITUICAO = :id AND FK_ID_DOCENTE = :docenteId
      `;
      // A checagem 'AND FK_ID_DOCENTE' é VITAL para segurança
      // Impede que um usuário atualize a instituição de outro
      
      const result = await connection.execute(
        sql, 
        { nome, id, docenteId: Number(docenteId) }, 
        { autoCommit: true }
      );
      
      // Se 'rowsAffected' for 0, significa que o ID não existe
      // ou não pertence àquele docente.
      if (result.rowsAffected === 0) {
        throw new Error("Instituição não encontrada ou não pertence a este docente.");
      }
      
      return { id, nome };
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
   * DELETE (SQL DELETE)
   */
  async deletar({ id, docenteId }: DeletarInstituicao) {
    let connection;
    try {
      connection = await getConn();
      const sql = `
        DELETE FROM INSTITUICAO 
        WHERE ID_INSTITUICAO = :id AND FK_ID_DOCENTE = :docenteId
      `;
      // A checagem 'AND FK_ID_DOCENTE' é VITAL para segurança
      
      const result = await connection.execute(
        sql, 
        { id, docenteId: Number(docenteId) }, 
        { autoCommit: true }
      );
      
      if (result.rowsAffected === 0) {
        throw new Error("Instituição não encontrada ou não pertence a este docente.");
      }
      
      return { message: "Deletado com sucesso" };
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