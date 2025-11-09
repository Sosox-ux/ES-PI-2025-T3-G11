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
exports.enviarEmailReset = enviarEmailReset;
const nodemailer = __importStar(require("nodemailer"));
require("dotenv/config");
let transport = null;
function getTransport() {
    return __awaiter(this, void 0, void 0, function* () {
        if (transport) {
            return transport;
        }
        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASS;
        if (!user || !pass) {
            console.error("ERRO: As credenciais EMAIL_USER e EMAIL_PASS não foram definidas no .env");
            throw new Error("Credenciais de e-mail não configuradas.");
        }
        transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass,
            },
        });
        return transport;
    });
}
function enviarEmailReset(emailDestino, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transport = yield getTransport();
            yield transport.sendMail({
                from: `"Projeto NotaDez" <${process.env.EMAIL_USER}>`,
                to: emailDestino,
                subject: 'Seu Código de Recuperação de Senha',
                html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc;">
          <h2>Recuperação de Senha - NotaDez</h2>
          <p>Olá!</p>
          <p>Você solicitou a recuperação da sua senha. Use o código abaixo:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">
            ${codigo}
          </p>
          <p>Este código expira em 15 minutos.</p>
        </div>
      `,
            });
            console.log('E-mail de reset enviado de verdade para: %s', emailDestino);
        }
        catch (error) {
            console.error("Erro ao enviar e-mail real:", error);
            throw new Error("Não foi possível enviar o e-mail de recuperação.");
        }
    });
}
//# sourceMappingURL=email.service.js.map