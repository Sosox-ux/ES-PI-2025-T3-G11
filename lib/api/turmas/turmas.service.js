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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurmasService = void 0;
const db_1 = require("../../config/db");
class TurmasService {
    /**
     * (CREATE) Criar Turma
     */
    criar(_a) {
        return __awaiter(this, arguments, void 0, function* ({ nome, codigo, apelido, idInstituicao, idDisciplina, docenteId }) {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                const docenteIdNum = Number(docenteId);
                // --- LÓGICA DE SEGURANÇA CORRIGIDA ---
                // 1. O docente é dono da INSTITUIÇÃO?
                const checkInstSql = `
        SELECT 1 FROM INSTITUICAO 
        WHERE ID_INSTITUICAO = :idInstituicao AND FK_ID_DOCENTE = :docenteIdNum
      `;
                const instResult = yield connection.execute(checkInstSql, { idInstituicao, docenteIdNum });
                if (!instResult.rows || instResult.rows.length === 0) {
                    throw new Error("Permissão negada. A instituição não pertence a este docente.");
                }
                // 2. O docente é dono da DISCIPLINA?
                const checkDiscSql = `
        SELECT 1 FROM DISCIPLINA
        WHERE ID_DISCIPLINA = :idDisciplina AND FK_ID_DOCENTE = :docenteIdNum
      `;
                const discResult = yield connection.execute(checkDiscSql, { idDisciplina, docenteIdNum });
                if (!discResult.rows || discResult.rows.length === 0) {
                    throw new Error("Permissão negada. A disciplina não pertence a este docente.");
                }
                // --- FIM DA CORREÇÃO ---
                // 3. Se for dono de ambos, pode inserir
                const sql = `
        INSERT INTO TURMA (NOME, CODIGO, APELIDO, FK_ID_DISCIPLINA, FK_ID_INSTITUICAO)
        VALUES (:nome, :codigo, :apelido, :idDisciplina, :idInstituicao)
      `;
                yield connection.execute(sql, {
                    nome: nome,
                    codigo: codigo || null,
                    apelido: apelido || null,
                    idDisciplina: idDisciplina,
                    idInstituicao: idInstituicao
                }, { autoCommit: true });
                return { nome, codigo, apelido, idDisciplina, idInstituicao };
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
     * (READ) Listar Turmas de uma Instituição
     */
    listarPorInstituicao(idInstituicao, docenteId) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                // --- SQL CORRIGIDO ---
                // A lógica de segurança é:
                // 1. A turma deve pertencer à Instituição (t.FK_ID_INSTITUICAO)
                // 2. A Instituição deve pertencer ao Docente (i.FK_ID_DOCENTE)
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
                const result = yield connection.execute(sql, { idInstituicao, docenteIdNum: Number(docenteId) });
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
     * (UPDATE) Atualizar Turma
     */
    atualizar(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, nome, codigo, apelido, docenteId }) {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                // --- SQL DE SEGURANÇA CORRIGIDO ---
                // (Só pode atualizar se for dono da INSTITUIÇÃO)
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
                const result = yield connection.execute(sql, {
                    nome: nome || null,
                    codigo: codigo || null,
                    apelido: apelido || null,
                    id: id,
                    docenteIdNum: Number(docenteId)
                }, { autoCommit: true });
                if (result.rowsAffected === 0) {
                    throw new Error("Turma não encontrada ou não pertence a este docente.");
                }
                return { id, nome, codigo, apelido };
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
     * (DELETE) Deletar Turma
     */
    deletar(id, docenteId) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                // --- SQL DE SEGURANÇA CORRIGIDO ---
                const sql = `
        DELETE FROM TURMA t
        WHERE t.ID_TURMA = :id
          AND EXISTS (
            SELECT 1 FROM INSTITUICAO i
            WHERE i.ID_INSTITUICAO = t.FK_ID_INSTITUICAO AND i.FK_ID_DOCENTE = :docenteIdNum
          )
      `;
                const result = yield connection.execute(sql, { id, docenteIdNum: Number(docenteId) }, { autoCommit: true });
                if (result.rowsAffected === 0) {
                    throw new Error("Turma não encontrada ou não pertence a este docente.");
                }
                return { message: "Deletado com sucesso" };
            }
            catch (error) {
                // ORA-02292: child record found (ex: uma INSCRICAO depende desta turma)
                if (error.errorNum === 2292) {
                    throw new Error("Não é possível deletar. Esta turma já possui alunos inscritos.");
                }
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
    listarPorDocente(docenteId) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
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
}
exports.TurmasService = TurmasService;
//# sourceMappingURL=turmas.service.js.map