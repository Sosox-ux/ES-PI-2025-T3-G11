"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turmasRoutes = void 0;
const express_1 = require("express");
const turmas_controller_1 = require("./turmas.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const turmasRoutes = (0, express_1.Router)();
exports.turmasRoutes = turmasRoutes;
const controller = new turmas_controller_1.TurmasController();
turmasRoutes.use(auth_middleware_1.authMiddleware);
turmasRoutes.post('/', (req, res) => controller.criar(req, res));
turmasRoutes.get('/', (req, res) => controller.listarPorDocente(req, res));
turmasRoutes.get('/instituicao/:idInstituicao', (req, res) => controller.listarPorInstituicao(req, res));
turmasRoutes.put('/:id', (req, res) => controller.atualizar(req, res));
turmasRoutes.delete('/:id', (req, res) => controller.deletar(req, res));
//# sourceMappingURL=turmas.routes.js.map