"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instituicoesRoutes = void 0;
const express_1 = require("express");
const instituicoes_controller_1 = require("./instituicoes.controller");
// 1. IMPORTAMOS O GUARDA (MUITO IMPORTANTE!)
// (Você precisa ter criado este arquivo em 'src/core/middleware/auth.middleware.ts')
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const instituicoesRoutes = (0, express_1.Router)();
exports.instituicoesRoutes = instituicoesRoutes;
const controller = new instituicoes_controller_1.InstituicoesController();
// 2. APLICA O "GUARDA" EM TODAS AS ROTAS DESTA PASTA
// Isso garante que ninguém que NÃO ESTEJA LOGADO pode criar,
// listar, ou deletar instituições.
instituicoesRoutes.use(auth_middleware_1.authMiddleware);
// --- DEFINIÇÃO DO CRUD ---
// CREATE (Criar)
// (URL final: POST /api/v1/instituicoes/)
instituicoesRoutes.post('/', (req, res) => controller.criar(req, res));
// READ (Listar)
// (URL final: GET /api/v1/instituicoes/)
instituicoesRoutes.get('/', (req, res) => controller.listar(req, res));
// UPDATE (Atualizar)
// (URL final: PUT /api/v1/instituicoes/:id)
instituicoesRoutes.put('/:id', (req, res) => controller.atualizar(req, res));
// DELETE (Deletar)
// (URL final: DELETE /api/v1/instituicoes/:id)
instituicoesRoutes.delete('/:id', (req, res) => controller.deletar(req, res));
//# sourceMappingURL=instituicoes.routes.js.map