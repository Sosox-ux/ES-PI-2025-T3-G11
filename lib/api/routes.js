"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unifiedRoutes = void 0;
const express_1 = require("express");
const auth_routes_1 = require("./auth/auth.routes");
const unifiedRoutes = (0, express_1.Router)();
exports.unifiedRoutes = unifiedRoutes;
unifiedRoutes.use('/auth', auth_routes_1.authRoutes);
//# sourceMappingURL=routes.js.map