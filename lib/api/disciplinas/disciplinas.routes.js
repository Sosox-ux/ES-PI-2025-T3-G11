"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disciplinasRoutes = void 0;
const express_1 = require("express");
const disciplinas_controller_1 = require("./disciplinas.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const disciplinasRoutes = (0, express_1.Router)();
exports.disciplinasRoutes = disciplinasRoutes;
const controller = new disciplinas_controller_1.DisciplinasController();
disciplinasRoutes.use(auth_middleware_1.authMiddleware);
disciplinasRoutes.post('/', (req, res) => controller.criar(req, res));
disciplinasRoutes.get('/', (req, res) => controller.listar(req, res));
disciplinasRoutes.delete('/:id', (req, res) => controller.deletar(req, res));
//# sourceMappingURL=disciplinas.routes.js.map