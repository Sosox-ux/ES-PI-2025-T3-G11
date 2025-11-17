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
exports.InstituicoesService = void 0;
const db_1 = require("../../config/db");
class InstituicoesService {
    criar(_a) {
        return __awaiter(this, arguments, void 0, function* ({ nome, local, docenteId }) {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                const sql = `
        INSERT INTO INSTITUICAO (NOME, LOCAL, FK_ID_DOCENTE)
        VALUES (:nome, :local, :docenteId)
      `;
                yield connection.execute(sql, {
                    nome,
                    local: local || null,
                    docenteId: Number(docenteId)
                }, { autoCommit: true });
                return { nome, local, docenteId };
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
    listar(docenteId) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                const sql = `
        SELECT ID_INSTITUICAO, NOME, LOCAL 
        FROM INSTITUICAO 
        WHERE FK_ID_DOCENTE = :docenteId
        ORDER BY NOME
      `;
                const result = yield connection.execute(sql, { docenteId: Number(docenteId) });
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
    deletar(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, docenteId }) {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                const sql = `
        DELETE FROM INSTITUICAO 
        WHERE ID_INSTITUICAO = :id AND FK_ID_DOCENTE = :docenteId
      `;
                const result = yield connection.execute(sql, { id, docenteId: Number(docenteId) }, { autoCommit: true });
                if (result.rowsAffected === 0) {
                    throw new Error("Instituição não encontrada ou não pertence a este docente.");
                }
                return { message: "Deletado com sucesso" };
            }
            catch (error) {
                if (error.errorNum === 2292) {
                    throw new Error("Não é possível deletar. Esta instituição já possui turmas ou alunos cadastrados. Por favor, remova-os primeiro.");
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
exports.InstituicoesService = InstituicoesService;
//# sourceMappingURL=instituicoes.service.js.map