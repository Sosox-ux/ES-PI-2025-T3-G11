"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alunoRoutes = void 0;
const express_1 = require("express");
const aluno_controller_1 = require("./aluno.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const upload_1 = require("../../core/middleware/upload");
const alunoRoutes = (0, express_1.Router)();
exports.alunoRoutes = alunoRoutes;
const controller = new aluno_controller_1.AlunosController();
alunoRoutes.use(auth_middleware_1.authMiddleware);
alunoRoutes.post('/', (req, res) => controller.criarEInscrever(req, res));
alunoRoutes.get('/', (req, res) => controller.listarPorDocente(req, res));
alunoRoutes.get('/turma/:idTurma', (req, res) => controller.listarPorTurma(req, res));
alunoRoutes.get('/turma', (req, res) => controller.listarPorTurma(req, res));
alunoRoutes.delete('/inscricao/:idInscricao', (req, res) => controller.desinscrever(req, res));
alunoRoutes.delete('/:idAluno', (req, res) => controller.excluirTotalmente(req, res));
alunoRoutes.post('/upload-csv/instituicao/:idInstituicao/turma/:idTurma', upload_1.uploadCsv.single('arquivoCsv'), (req, res) => controller.uploadCSV(req, res));
//# sourceMappingURL=aluno.routes.js.map