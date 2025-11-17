"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlunosService = void 0;
const db_1 = require("../../config/db");
const oracledb_1 = __importDefault(require("oracledb"));
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
class AlunosService {
    criarEInscrever(_a) {
        return __awaiter(this, arguments, void 0, function* ({ nomeCompleto, matricula, idInstituicao, idTurma, docenteId }) {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                const docenteIdNum = Number(docenteId);
                const checkSql = `
        SELECT 1 FROM TURMA t
        JOIN DISCIPLINA d ON t.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
        WHERE t.ID_TURMA = :idTurma AND d.FK_ID_DOCENTE = :docenteIdNum
      `;
                const checkResult = yield connection.execute(checkSql, { idTurma, docenteIdNum });
                if (!checkResult.rows || checkResult.rows.length === 0) {
                    throw new Error("Permissão negada. A turma não pertence a este docente.");
                }
                // 2. ENCONTRA OU CRIA O ALUNO
                let idAluno;
                const findAlunoSql = `
        SELECT ID_ALUNO FROM ALUNO
        WHERE MATRICULA = :matricula 
          AND FK_ID_INSTITUICAO = :idInstituicao 
          AND FK_ID_DOCENTE = :docenteIdNum
      `;
                const findResult = yield connection.execute(findAlunoSql, { matricula, idInstituicao, docenteIdNum });
                if (findResult.rows && findResult.rows.length > 0) {
                    idAluno = findResult.rows[0].ID_ALUNO;
                }
                else {
                    const insertAlunoSql = `
          INSERT INTO ALUNO (NOME_COMPLETO, MATRICULA, FK_ID_DOCENTE, FK_ID_INSTITUICAO)
          VALUES (:nomeCompleto, :matricula, :docenteIdNum, :idInstituicao)
          RETURNING ID_ALUNO INTO :outId
        `;
                    const insertResult = yield connection.execute(insertAlunoSql, { nomeCompleto, matricula, docenteIdNum, idInstituicao, outId: { dir: oracledb_1.default.BIND_OUT, type: oracledb_1.default.NUMBER } });
                    idAluno = insertResult.outBinds.outId[0];
                }
                // 3. INSCREVE O ALUNO NA TURMA (E RETORNA O NOVO ID_INSCRICAO)
                //    👇 MUDANÇA AQUI 👇
                const insertInscricaoSql = `
        INSERT INTO INSCRICAO (FK_ID_ALUNO, FK_ID_TURMA)
        VALUES (:idAluno, :idTurma)
        RETURNING ID_INSCRICAO INTO :outIdInscricao
      `;
                let idInscricao;
                try {
                    const inscResult = yield connection.execute(insertInscricaoSql, { idAluno, idTurma, outIdInscricao: { dir: oracledb_1.default.BIND_OUT, type: oracledb_1.default.NUMBER } });
                    idInscricao = inscResult.outBinds.outIdInscricao[0];
                }
                catch (err) {
                    if (err.errorNum === 1) {
                        throw new Error("Conflito: Este aluno já está inscrito nesta turma.");
                    }
                    throw err;
                }
                yield connection.commit();
                return {
                    ID_ALUNO: idAluno,
                    ID_INSCRICAO: idInscricao,
                    NOME_COMPLETO: nomeCompleto,
                    MATRICULA: matricula
                };
            }
            catch (error) {
                if (connection)
                    yield connection.rollback();
                console.error(error);
                throw error;
            }
            finally {
                if (connection) {
                    try {
                        yield connection.close();
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            }
        });
    }
    /**
     * (Tabela) Lista os alunos JÁ INSCRITOS em uma turma
     */
    listarPorTurma(idTurma, docenteId) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                const sql = `
        SELECT 
          a.ID_ALUNO, 
          a.NOME_COMPLETO, 
          a.MATRICULA,
          i.ID_INSCRICAO -- O ID da Inscrição (para o botão deletar)
        FROM ALUNO a
        JOIN INSCRICAO i ON a.ID_ALUNO = i.FK_ID_ALUNO
        JOIN TURMA t ON i.FK_ID_TURMA = t.ID_TURMA
        JOIN DISCIPLINA d ON t.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
        WHERE i.FK_ID_TURMA = :idTurma 
          AND d.FK_ID_DOCENTE = :docenteIdNum
        ORDER BY a.NOME_COMPLETO
      `;
                const result = yield connection.execute(sql, { idTurma, docenteIdNum: Number(docenteId) });
                return result.rows || [];
            }
            catch (error) {
                console.error(error);
                throw error;
            }
            finally {
                if (connection) {
                    try {
                        yield connection.close();
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            }
        });
    }
    /**
     * (Botão Remover) Remove um aluno de uma turma (Deleta INSCRIÇÃO)
     */
    desinscrever(idInscricao, docenteId) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                const sql = `
        DELETE FROM INSCRICAO i
        WHERE i.ID_INSCRICAO = :idInscricao
          AND EXISTS (
            SELECT 1 FROM TURMA t
            JOIN DISCIPLINA d ON t.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
            WHERE t.ID_TURMA = i.FK_ID_TURMA AND d.FK_ID_DOCENTE = :docenteIdNum
          )
      `;
                const result = yield connection.execute(sql, { idInscricao, docenteIdNum: Number(docenteId) }, { autoCommit: true });
                if (result.rowsAffected === 0) {
                    throw new Error("Inscrição não encontrada ou não pertence a este docente.");
                }
                return { message: "Aluno desinscrito com sucesso" };
            }
            catch (error) {
                console.error(error);
                throw error;
            }
            finally {
                if (connection) {
                    try {
                        yield connection.close();
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            }
        });
    }
    /**
     * (Upload CSV) Processa o arquivo
     */
    processarCSV(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filePath, idInstituicao, idTurma, docenteId }) {
            const alunosParaProcessar = [];
            // 1. Lê o arquivo CSV
            yield new Promise((resolve, reject) => {
                fs_1.default.createReadStream(filePath)
                    .pipe((0, csv_parser_1.default)({ headers: ['Matricula', 'Nome'], skipLines: 1 }))
                    .on('data', (row) => {
                    if (row.Matricula && row.Nome) {
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
            fs_1.default.unlinkSync(filePath);
            // 3. Processa cada aluno (um de cada vez)
            let sucesso = 0;
            let falhas = 0;
            const erros = [];
            for (const aluno of alunosParaProcessar) {
                try {
                    // Reutiliza a lógica de 'criarEInscrever'
                    yield this.criarEInscrever(aluno);
                    sucesso++;
                }
                catch (error) {
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
        });
    }
    listarPorDocente(docenteId) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
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
                const result = yield connection.execute(sql, { docenteIdNum: Number(docenteId) });
                return result.rows || [];
            }
            catch (error) {
                console.error(error);
                throw error;
            }
            finally {
                if (connection) {
                    try {
                        yield connection.close();
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            }
        });
    }
    /**
     * (Lista geral) Exclui completamente um aluno do sistema (notas, inscrições e aluno)
     */
    excluirAlunoTotalmente(idAluno, docenteId) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                const docenteIdNum = Number(docenteId);
                // 1. Verifica se o aluno pertence a este docente
                const checkSql = `
        SELECT 1
        FROM ALUNO
        WHERE ID_ALUNO = :idAluno
          AND FK_ID_DOCENTE = :docenteIdNum
      `;
                const checkResult = yield connection.execute(checkSql, { idAluno, docenteIdNum });
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
                yield connection.execute(deleteNotasSql, { idAluno });
                // 3. Remove inscrições do aluno em qualquer turma
                const deleteInscricoesSql = `
        DELETE FROM INSCRICAO
        WHERE FK_ID_ALUNO = :idAluno
      `;
                yield connection.execute(deleteInscricoesSql, { idAluno });
                // 4. Remove o próprio aluno
                const deleteAlunoSql = `
        DELETE FROM ALUNO
        WHERE ID_ALUNO = :idAluno
          AND FK_ID_DOCENTE = :docenteIdNum
      `;
                const result = yield connection.execute(deleteAlunoSql, { idAluno, docenteIdNum });
                if (result.rowsAffected === 0) {
                    throw new Error("Falha ao excluir aluno.");
                }
                yield connection.commit();
                return { message: "Aluno excluído com sucesso." };
            }
            catch (error) {
                if (connection)
                    yield connection.rollback();
                console.error(error);
                throw error;
            }
            finally {
                if (connection) {
                    try {
                        yield connection.close();
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            }
        });
    }
}
exports.AlunosService = AlunosService;
//# sourceMappingURL=aluno.service.js.map