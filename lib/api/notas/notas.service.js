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
exports.NotasService = void 0;
const db_1 = require("../../config/db");
class NotasService {
    // Busca os componentes (P1, P2) da disciplina
    listarComponentesPorDisciplina(idDisciplina, docenteId) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                const sql = `
        SELECT c.ID_COMPONENTE, c.NOME, c.SIGLA, c.PESO
        FROM COMPONENTE_NOTA c
        JOIN DISCIPLINA d ON c.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
        WHERE c.FK_ID_DISCIPLINA = :idDisciplina
          AND d.FK_ID_DOCENTE = :docenteId
        ORDER BY c.ID_COMPONENTE
      `;
                const result = yield connection.execute(sql, { idDisciplina, docenteId: Number(docenteId) });
                return result.rows || [];
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
    // Monta a grade: Aluno + Notas existentes
    listarNotasGridPorTurma(idTurma, docenteId) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                // Valida permissão
                const checkSql = `
        SELECT 1 FROM TURMA t
        JOIN DISCIPLINA d ON t.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
        WHERE t.ID_TURMA = :idTurma AND d.FK_ID_DOCENTE = :docenteId
      `;
                const checkResult = yield connection.execute(checkSql, { idTurma, docenteId: Number(docenteId) });
                if (!checkResult.rows || checkResult.rows.length === 0) {
                    throw new Error("Permissão negada ou turma não encontrada.");
                }
                // Busca alunos e suas notas (LEFT JOIN)
                const sql = `
        SELECT
            i.ID_INSCRICAO,
            a.NOME_COMPLETO,
            a.MATRICULA,
            n.FK_ID_COMPONENTE,
            n.VALOR_NOTA
        FROM INSCRICAO i
        JOIN ALUNO a ON i.FK_ID_ALUNO = a.ID_ALUNO
        LEFT JOIN NOTA n ON i.ID_INSCRICAO = n.FK_ID_INSCRICAO
        WHERE i.FK_ID_TURMA = :idTurma
        ORDER BY a.NOME_COMPLETO
      `;
                const result = yield connection.execute(sql, { idTurma });
                // Transforma linhas do banco em objetos aninhados para o frontend
                const gridData = {};
                result.rows.forEach(row => {
                    if (!gridData[row.ID_INSCRICAO]) {
                        gridData[row.ID_INSCRICAO] = {
                            idInscricao: row.ID_INSCRICAO,
                            nomeCompleto: row.NOME_COMPLETO,
                            matricula: row.MATRICULA,
                            notas: {} // Objeto mapa: { 'ID_COMPONENTE': VALOR }
                        };
                    }
                    if (row.FK_ID_COMPONENTE !== null) {
                        gridData[row.ID_INSCRICAO].notas[row.FK_ID_COMPONENTE] = row.VALOR_NOTA;
                    }
                });
                return Object.values(gridData);
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
    // Salva várias notas de uma vez
    lancarOuAtualizarLote(notas, docenteId) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                const idsInscricao = [...new Set(notas.map(n => n.idInscricao))];
                if (idsInscricao.length === 0)
                    return { message: "Nenhuma nota para salvar." };
                // 2. CORREÇÃO: Construção segura dos binds para o IN (...)
                const bindObj = { docenteId: Number(docenteId) };
                const bindNames = idsInscricao.map((id, i) => {
                    const key = `b${i}`;
                    bindObj[key] = id;
                    return `:${key}`;
                }).join(',');
                const checkSql = `
        SELECT i.ID_INSCRICAO FROM INSCRICAO i
        JOIN TURMA t ON i.FK_ID_TURMA = t.ID_TURMA
        JOIN DISCIPLINA d ON t.FK_ID_DISCIPLINA = d.ID_DISCIPLINA
        WHERE i.ID_INSCRICAO IN (${bindNames}) AND d.FK_ID_DOCENTE = :docenteId
      `;
                const checkResult = yield connection.execute(checkSql, bindObj);
                const idsValidos = new Set(checkResult.rows.map(r => r.ID_INSCRICAO));
                if (idsValidos.size !== idsInscricao.length) {
                    throw new Error("Permissão negada. Algumas inscrições não pertencem a este docente.");
                }
                // MERGE (Upsert) no Oracle
                const sql = `
        MERGE INTO NOTA n
        USING (
            SELECT :idInscricao AS FK_ID_INSCRICAO, :idComponente AS FK_ID_COMPONENTE FROM dual
        ) src ON (n.FK_ID_INSCRICAO = src.FK_ID_INSCRICAO AND n.FK_ID_COMPONENTE = src.FK_ID_COMPONENTE)
        WHEN MATCHED THEN
            UPDATE SET n.VALOR_NOTA = :valorNota
        WHEN NOT MATCHED THEN
            INSERT (FK_ID_INSCRICAO, FK_ID_COMPONENTE, VALOR_NOTA)
            VALUES (:idInscricao, :idComponente, :valorNota)
      `;
                const bindsMany = notas.map(nota => ({
                    idInscricao: nota.idInscricao,
                    idComponente: nota.idComponente,
                    valorNota: nota.valorNota
                }));
                yield connection.executeMany(sql, bindsMany, { autoCommit: true });
                return { message: `${notas.length} notas salvas com sucesso.` };
            }
            catch (error) {
                console.error("Erro ao salvar notas:", error);
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
exports.NotasService = NotasService;
//# sourceMappingURL=notas.service.js.map