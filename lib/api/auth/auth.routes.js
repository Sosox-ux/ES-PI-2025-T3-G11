"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const authRoutes = (0, express_1.Router)();
exports.authRoutes = authRoutes;
const controller = new auth_controller_1.AuthController();
authRoutes.post('/register', (req, res) => controller.criarConta(req, res));
authRoutes.post('/login', (req, res) => controller.login(req, res));
//# sourceMappingURL=auth.routes.js.map