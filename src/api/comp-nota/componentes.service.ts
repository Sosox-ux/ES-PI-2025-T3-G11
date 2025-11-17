// Feito por Sophia :)

import { getConn } from '../../config/db';

/**
 * DTO (Data Transfer Object) para a criação de um componente de nota.
 */
interface CriarComponenteDTO {
  nome: string;
  sigla: string;
  peso: number;
  idDisciplina: number;
}

/**
 * Serviço de Componentes de Nota: contém a lógica de negócios para listar, criar e deletar componentes.
 */
export class ComponentesService {

  /**
   * Lista todos os componentes de nota associados a uma disciplina.
   * @param {number} idDisciplina - O ID da disciplina.
   * @returns {Promise<Array>} Uma lista de componentes de nota.
   */
  async listar(idDisciplina: number) {
    let connection;
    try {
      connection = await getConn();
      const sql = `
        SELECT ID_COMPONENTE, NOME, SIGLA, PESO 
        FROM COMPONENTE_NOTA 
        WHERE FK_ID_DISCIPLINA = :idDisciplina
        ORDER BY ID_COMPONENTE ASC
      `;
      const result = await connection.execute(sql, { idDisciplina });
      return result.rows || [];
    } finally {
      if (connection) try { await connection.close(); } catch(e) {}
    }
  }

  /**
   * Cria um novo componente de nota no banco de dados.
   * @param {CriarComponenteDTO} data - Os dados do componente a ser criado.
   */
  async criar({ nome, sigla, peso, idDisciplina }: CriarComponenteDTO) {
    let connection;
    try {
      connection = await getConn();
      const sql = `
        INSERT INTO COMPONENTE_NOTA (NOME, SIGLA, PESO, FK_ID_DISCIPLINA)
        VALUES (:nome, :sigla, :peso, :idDisciplina)
      `;
      await connection.execute(sql, { nome, sigla, peso, idDisciplina }, { autoCommit: true });
    } finally {
      if (connection) try { await connection.close(); } catch(e) {}
    }
  }

  /**
   * Deleta um componente de nota pelo seu ID.
   * @param {number} id - O ID do componente a ser deletado.
   */
  async deletar(id: number) {
    let connection;
    try {
      connection = await getConn();
      const sql = `DELETE FROM COMPONENTE_NOTA WHERE ID_COMPONENTE = :id`;
      await connection.execute(sql, { id }, { autoCommit: true });
    } finally {
      if (connection) try { await connection.close(); } catch(e) {}
    }
  }
}
