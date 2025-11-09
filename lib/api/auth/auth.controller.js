"use strict";
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
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    constructor() {
        // Instancia o Service para poder usá-lo
        this.authService = new auth_service_1.AuthService();
    }
    /**
     * Controlador para CRIAR CONTA (Register)
     */
    criarConta(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Pega os dados do frontend (que vieram no 'body' da requisição)
            // (Isso é o que seu 'cadastro.js' envia)
            const { nome, email, telefone, senha } = req.body;
            // 2. Validação simples de campos obrigatórios
            if (!nome || !email || !telefone || !senha) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
            }
            try {
                const novoDocente = yield this.authService.criarConta({
                    nome,
                    email,
                    telefone,
                    senha
                });
                return res.status(201).json(novoDocente);
            }
            catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'Este e-mail já está em uso.') {
                        return res.status(400).json({ error: error.message });
                    }
                }
                console.error(error);
                return res.status(500).json({ error: 'Erro interno ao criar conta.' });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, senha } = req.body;
            if (!email || !senha) {
                return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
            }
            try {
                const resultadoLogin = yield this.authService.realizarLogin({ email, senha });
                return res.json(resultadoLogin);
            }
            catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'E-mail ou senha inválidos.') {
                        return res.status(401).json({ error: error.message });
                    }
                }
                console.error(error);
                return res.status(500).json({ error: 'Erro interno ao fazer login.' });
            }
        });
    }
    pedirCodigoReset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: 'O e-mail é obrigatório.' });
            }
            try {
                yield this.authService.gerarCodigoReset(email);
                // **IMPORTANTE (Segurança):** Sempre retorne sucesso, mesmo se o e-mail não existir.
                // Isso impede que hackers "adivinhem" e-mails cadastrados.
                return res.json({ message: 'Se o e-mail estiver cadastrado, um código de recuperação foi enviado.' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
            }
        });
    }
    /**
     * Controlador para RESETAR A SENHA
     */
    resetarSenha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, codigo, novaSenha } = req.body;
            if (!email || !codigo || !novaSenha) {
                return res.status(400).json({ error: 'E-mail, código e nova senha são obrigatórios.' });
            }
            try {
                yield this.authService.resetarSenha(email, codigo, novaSenha);
                return res.json({ message: 'Senha alterada com sucesso!' });
            }
            catch (error) {
                // Trata erros específicos do Service
                if (error instanceof Error) {
                    if (error.message === 'Código inválido ou expirado.') {
                        return res.status(400).json({ error: error.message });
                    }
                }
                console.error(error);
                return res.status(500).json({ error: 'Erro interno ao resetar a senha.' });
            }
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map