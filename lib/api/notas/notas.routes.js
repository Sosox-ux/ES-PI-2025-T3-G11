"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notasRoutes = void 0;
const express_1 = require("express");
const notas_controller_1 = require("./notas.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const notasRoutes = (0, express_1.Router)();
exports.notasRoutes = notasRoutes;
const controller = new notas_controller_1.NotasController();
notasRoutes.use(auth_middleware_1.authMiddleware);
// Rota para buscar os "cabeçalhos" da tabela de notas (Prova 1, Trabalho, etc.)
notasRoutes.get('/componentes/disciplina/:idDisciplina', (req, res) => controller.listarComponentes(req, res));
// Rota para buscar os dados da grade (alunos + notas)
notasRoutes.get('/turma/:idTurma', (req, res) => controller.listarGrid(req, res));
// Rota para salvar um lote de notas
notasRoutes.post('/lote', (req, res) => controller.salvarLote(req, res));
//# sourceMappingURL=notas.routes.js.map