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
exports.DisciplinasService = void 0;
const db_1 = require("../../config/db");
class DisciplinasService {
    /**
     * (CREATE) Criar Disciplina
     */
    criar(_a) {
        return __awaiter(this, arguments, void 0, function* ({ nome, sigla, codigo, periodo_curso, docenteId }) {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                // Lógica simplificada: Apenas insere com o FK_ID_DOCENTE do token
                const sql = `
        INSERT INTO DISCIPLINA (NOME, SIGLA, CODIGO, PERIODO_CURSO, FK_ID_DOCENTE)
        VALUES (:nome, :sigla, :codigo, :periodo_curso, :docenteId)
      `;
                yield connection.execute(sql, {
                    nome: nome,
                    sigla: sigla || null,
                    codigo: codigo || null,
                    periodo_curso: periodo_curso || null,
                    docenteId: Number(docenteId)
                }, { autoCommit: true });
                return { nome, sigla, codigo, periodo_curso };
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
     * (READ) Listar TODAS as Disciplinas do Docente
     */
    listar(docenteId) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                // Lógica simplificada: Puxa todas as disciplinas do docente
                const sql = `
        SELECT ID_DISCIPLINA, NOME, SIGLA, CODIGO, PERIODO_CURSO
        FROM DISCIPLINA
        WHERE FK_ID_DOCENTE = :docenteIdNum
        ORDER BY NOME
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
     * (UPDATE) Atualizar Disciplina
     */
    atualizar(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, nome, sigla, codigo, periodo_curso, docenteId }) {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                // Query de segurança: só atualiza SE o docente for o dono
                const sql = `
        UPDATE DISCIPLINA
        SET 
          NOME = :nome,
          SIGLA = :sigla,
          CODIGO = :codigo,
          PERIODO_CURSO = :periodo_curso
        WHERE ID_DISCIPLINA = :id AND FK_ID_DOCENTE = :docenteIdNum
      `;
                const result = yield connection.execute(sql, {
                    nome: nome,
                    sigla: sigla || null,
                    codigo: codigo || null,
                    periodo_curso: periodo_curso || null,
                    id: id,
                    docenteIdNum: Number(docenteId)
                }, { autoCommit: true });
                if (result.rowsAffected === 0) {
                    throw new Error("Disciplina não encontrada ou não pertence a este docente.");
                }
                return { id, nome, sigla, codigo, periodo_curso };
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
     * (DELETE) Deletar Disciplina
     */
    deletar(id, docenteId) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                // Query de segurança: só deleta SE o docente for o dono
                const sql = `
        DELETE FROM DISCIPLINA
        WHERE ID_DISCIPLINA = :id AND FK_ID_DOCENTE = :docenteIdNum
      `;
                const result = yield connection.execute(sql, { id, docenteIdNum: Number(docenteId) }, { autoCommit: true });
                if (result.rowsAffected === 0) {
                    throw new Error("Disciplina não encontrada ou não pertence a este docente.");
                }
                return { message: "Deletado com sucesso" };
            }
            catch (error) {
                // ORA-02292: child record found (ex: uma TURMA depende desta disciplina)
                if (error.errorNum === 2292) {
                    throw new Error("Não é possível deletar. Esta disciplina já possui turmas cadastradas.");
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
}
exports.DisciplinasService = DisciplinasService;
//# sourceMappingURL=disciplinas.service.js.map