// Feito por Sophia :)

import { getConn } from '../../config/db';
import oracledb from 'oracledb';
import fs from 'fs';
import csv from 'csv-parser';

/**
 * DTO (Data Transfer Object) para a criação e inscrição de um aluno.
 */
interface AlunoDTO {
  nomeCompleto: string;
  matricula: string;
  idInstituicao: number;
  idTurma: number;
  docenteId: string;
}

/**
 * DTO para o processamento de arquivos CSV de alunos.
 */
interface CsvDTO {
  filePath: string;
  idInstituicao: number;
  idTurma: number;
  docenteId: string;
}

/**
 * Serviço de alunos: contém a lógica de negócios para operações CRUD e processamento de CSV.
 */
export class AlunosService {

  /**
   * Cria um novo aluno (se não existir) e o inscreve em uma turma específica.
   * Realiza validações de permissão e trata casos de aluno já inscrito.
   * @param {AlunoDTO} data - Dados do aluno e da inscrição.
   * @returns {Promise<object>} Objeto com os dados do aluno e da inscrição.
   */
  async criarEInscrever({ nomeCompleto, matricula, idInstituicao, idTurma, docenteId }: AlunoDTO) {
    let connection;
    try {
      connection = await getConn();
      
      const docenteIdNum = Number(docenteId);

      // 1. Verifica se a turma pertence ao docente
      const checkSql = `
        SELECT 1 FROM TURMA t
        JOIN DISCIPLINA d ON t.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
        WHERE t.ID_TURMA = :idTurma AND d.FK_ID_DOCENTE = :docenteIdNum
      `;
      const checkResult = await connection.execute(checkSql, { idTurma, docenteIdNum });
      if (!checkResult.rows || checkResult.rows.length === 0) {
        throw new Error("Permissão negada. A turma não pertence a este docente.");
      }

      // 2. Encontra ou cria o aluno
      let idAluno: number;
      
      const findAlunoSql = `
        SELECT ID_ALUNO FROM ALUNO
        WHERE MATRICULA = :matricula 
          AND FK_ID_INSTITUICAO = :idInstituicao 
          AND FK_ID_DOCENTE = :docenteIdNum
      `;
      const findResult = await connection.execute(findAlunoSql, { matricula, idInstituicao, docenteIdNum });

      if (findResult.rows && findResult.rows.length > 0) {
        idAluno = (findResult.rows[0] as any).ID_ALUNO;
      } else {
        const insertAlunoSql = `
          INSERT INTO ALUNO (NOME_COMPLETO, MATRICULA, FK_ID_DOCENTE, FK_ID_INSTITUICAO)
          VALUES (:nomeCompleto, :matricula, :docenteIdNum, :idInstituicao)
          RETURNING ID_ALUNO INTO :outId
        `;
        const insertResult = await connection.execute(
          insertAlunoSql,
          { nomeCompleto, matricula, docenteIdNum, idInstituicao, outId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
        );
        idAluno = (insertResult.outBinds as any).outId[0];
      }

      // 3. Inscreve o aluno na turma
      const insertInscricaoSql = `
        INSERT INTO INSCRICAO (FK_ID_ALUNO, FK_ID_TURMA)
        VALUES (:idAluno, :idTurma)
        RETURNING ID_INSCRICAO INTO :outIdInscricao
      `;
      let idInscricao: number;
      try {
        const inscResult = await connection.execute(
            insertInscricaoSql, 
            { idAluno, idTurma, outIdInscricao: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
        );
        idInscricao = (inscResult.outBinds as any).outIdInscricao[0];
      } catch (err: any) {
        if (err.errorNum === 1) {
          throw new Error("Conflito: Este aluno já está inscrito nesta turma.");
        }
        throw err;
      }
      
      await connection.commit();
      
      return { 
          ID_ALUNO: idAluno, 
          ID_INSCRICAO: idInscricao, 
          NOME_COMPLETO: nomeCompleto, 
          MATRICULA: matricula 
      };

    } catch (error) {
      if (connection) await connection.rollback();
      console.error(error);
      throw error;
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }

  /**
   * Lista todos os alunos inscritos em uma turma específica, verificando a permissão do docente.
   * @param {number} idTurma - ID da turma.
   * @param {string} docenteId - ID do docente autenticado.
   * @returns {Promise<Array>} Lista de alunos.
   */
  async listarPorTurma(idTurma: number, docenteId: string) {
    let connection;
    try {
      connection = await getConn();
      const sql = `
        SELECT 
          a.ID_ALUNO, 
          a.NOME_COMPLETO, 
          a.MATRICULA,
          i.ID_INSCRICAO 
        FROM ALUNO a
        JOIN INSCRICAO i ON a.ID_ALUNO = i.FK_ID_ALUNO
        JOIN TURMA t ON i.FK_ID_TURMA = t.ID_TURMA
        JOIN DISCIPLINA d ON t.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
        WHERE i.FK_ID_TURMA = :idTurma 
          AND d.FK_ID_DOCENTE = :docenteIdNum
        ORDER BY a.NOME_COMPLETO
      `;
      const result = await connection.execute(sql, { idTurma, docenteIdNum: Number(docenteId) });
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
   * Remove a inscrição de um aluno em uma turma, verificando a permissão do docente.
   * @param {number} idInscricao - ID da inscrição a ser removida.
   * @param {string} docenteId - ID do docente autenticado.
   * @returns {Promise<object>} Mensagem de sucesso.
   */
  async desinscrever(idInscricao: number, docenteId: string) {
    let connection;
    try {
      connection = await getConn();
      const sql = `
        DELETE FROM INSCRICAO i
        WHERE i.ID_INSCRICAO = :idInscricao
          AND EXISTS (
            SELECT 1 FROM TURMA t
            JOIN DISCIPLINA d ON t.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
            WHERE t.ID_TURMA = i.FK_ID_TURMA AND d.FK_ID_DOCENTE = :docenteIdNum
          )
      `;
      const result = await connection.execute(sql, { idInscricao, docenteIdNum: Number(docenteId) }, { autoCommit: true });
      if (result.rowsAffected === 0) {
        throw new Error("Inscrição não encontrada ou não pertence a este docente.");
      }
      return { message: "Aluno desinscrito com sucesso" };
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
   * Processa um arquivo CSV para criar ou inscrever alunos em massa.
   * Remove o arquivo temporário após o processamento.
   * @param {CsvDTO} data - Caminho do arquivo CSV e IDs de instituição/turma.
   * @returns {Promise<object>} Resumo do processamento (sucessos, falhas, erros).
   */
  async processarCSV({ filePath, idInstituicao, idTurma, docenteId }: CsvDTO) {
    const alunosParaProcessar: any[] = [];
    
    // 1. Lê o arquivo CSV
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({ headers: ['Matricula', 'Nome'], skipLines: 1 }))
        .on('data', (row) => {
          if (row.Matricula && row.Nome && row.Matricula !== 'Matricula') {
            alunosParaProcessar.push({
              nomeCompleto: row.Nome,
              matricula: row.Matricula,
              idInstituicao,
              idTurma,
              docenteId
            });
          }
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    // 2. Deleta o arquivo temporário
    fs.unlinkSync(filePath);

    // 3. Processa cada aluno (um de cada vez)
    let sucesso = 0;
    let falhas = 0;
    const erros: string[] = [];

    for (const aluno of alunosParaProcessar) {
      try {
        // Reutiliza a lógica de 'criarEInscrever'
        await this.criarEInscrever(aluno);
        sucesso++;
      } catch (error: any) {
        falhas++;
        erros.push(`Matrícula ${aluno.matricula}: ${error.message}`);
      }
    }
    
    return { 
      message: "Processamento CSV concluído.",
      sucesso,
      falhas,
      erros
    };
  }
  
  /**
   * Lista todos os alunos vinculados a um docente, incluindo o nome da instituição.
   * @param {string} docenteId - ID do docente autenticado.
   * @returns {Promise<Array>} Lista de alunos com informações da instituição.
   */
  async listarPorDocente(docenteId: string) {
    let connection;
    try {
      connection = await getConn();
      
      // SQL que busca todos os alunos do docente E o nome da instituição
      const sql = `
        SELECT 
          a.ID_ALUNO, 
          a.NOME_COMPLETO, 
          a.MATRICULA,
          inst.NOME AS NOME_INSTITUICAO
        FROM ALUNO a
        LEFT JOIN INSTITUICAO inst ON a.FK_ID_INSTITUICAO = inst.ID_INSTITUICAO
        WHERE a.FK_ID_DOCENTE = :docenteIdNum
        ORDER BY a.NOME_COMPLETO
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
   * Exclui completamente um aluno do sistema, incluindo suas notas, inscrições e o registro do aluno.
   * Valida se o aluno pertence ao docente antes de realizar a exclusão.
   * Esta é uma operação destrutiva e deve ser usada com cautela.
   * @param {number} idAluno - ID do aluno a ser excluído.
   * @param {string} docenteId - ID do docente autenticado.
   * @returns {Promise<object>} Mensagem de sucesso.
   */
  async excluirAlunoTotalmente(idAluno: number, docenteId: string) {
    let connection;
    try {
      connection = await getConn();
      const docenteIdNum = Number(docenteId);

      // 1. Verifica se o aluno pertence a este docente
      const checkSql = `
        SELECT 1
        FROM ALUNO
        WHERE ID_ALUNO = :idAluno
          AND FK_ID_DOCENTE = :docenteIdNum
      `;
      const checkResult = await connection.execute(checkSql, { idAluno, docenteIdNum });
      if (!checkResult.rows || checkResult.rows.length === 0) {
        throw new Error("Aluno não encontrado para este docente.");
      }

      // 2. Remove notas vinculadas às inscrições do aluno
      const deleteNotasSql = `
        DELETE FROM NOTA n
        WHERE n.FK_ID_INSCRICAO IN (
          SELECT i.ID_INSCRICAO
          FROM INSCRICAO i
          WHERE i.FK_ID_ALUNO = :idAluno
        )
      `;
      await connection.execute(deleteNotasSql, { idAluno });

      // 3. Remove inscrições do aluno em qualquer turma
      const deleteInscricoesSql = `
        DELETE FROM INSCRICAO
        WHERE FK_ID_ALUNO = :idAluno
      `;
      await connection.execute(deleteInscricoesSql, { idAluno });

      // 4. Remove o próprio aluno
      const deleteAlunoSql = `
        DELETE FROM ALUNO
        WHERE ID_ALUNO = :idAluno
          AND FK_ID_DOCENTE = :docenteIdNum
      `;
      const result = await connection.execute(deleteAlunoSql, { idAluno, docenteIdNum });

      if (result.rowsAffected === 0) {
        throw new Error("Falha ao excluir aluno.");
      }

      await connection.commit();

      return { message: "Aluno excluído com sucesso." };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error(error);
      throw error;
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }
}
