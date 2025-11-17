"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unifiedRoutes = void 0;
const express_1 = require("express");
const auth_routes_1 = require("./auth/auth.routes");
const instituicoes_routes_1 = require("./instituicoes/instituicoes.routes");
const turmas_routes_1 = require("./turmas/turmas.routes");
const disciplinas_routes_1 = require("./disciplinas/disciplinas.routes");
const aluno_routes_1 = require("./aluno/aluno.routes");
const notas_routes_1 = require("./notas/notas.routes");
const unifiedRoutes = (0, express_1.Router)();
exports.unifiedRoutes = unifiedRoutes;
unifiedRoutes.use('/auth', auth_routes_1.authRoutes);
unifiedRoutes.use('/instituicoes', instituicoes_routes_1.instituicoesRoutes);
unifiedRoutes.use('/turmas', turmas_routes_1.turmasRoutes);
unifiedRoutes.use('/disciplinas', disciplinas_routes_1.disciplinasRoutes);
unifiedRoutes.use('/alunos', aluno_routes_1.alunoRoutes);
unifiedRoutes.use('/notas', notas_routes_1.notasRoutes);
//# sourceMappingURL=routes.js.map