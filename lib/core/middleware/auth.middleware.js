"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    // pega o "Crachá" do cabeçalho da requisição
    const authHeader = req.headers.authorization;
    // verifica se o crachá foi enviado
    if (!authHeader) {
        return res.status(401).json({ error: 'Nenhum token fornecido.' });
    }
    // 3. O formato do crachá é "Bearer SEU_TOKEN_LONGO"
    //    Vamos separar o "Bearer" do "TOKEN"
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Token em formato inválido.' });
    }
    const [scheme, token] = parts;
    // Verifica se a primeira parte é mesmo "Bearer"
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Token mal formatado.' });
    }
    // senha secreta do .env
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({ error: 'JWT Secret não configurado no servidor.' });
    }
    // verifica se o "Crachá" é válido
    try {
        // Tenta "decodificar" o crachá usando a senha secreta
        const decoded = jwt.verify(token, secret);
        req.docenteId = decoded.docenteId;
        // deixa a requisição passar para o controller
        return next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map