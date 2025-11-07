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
exports.AuthService = void 0;
const db_1 = require("../../config/db");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const crypto_1 = require("crypto");
class AuthService {
    criarConta(_a) {
        return __awaiter(this, arguments, void 0, function* ({ nome, email, telefone, senha }) {
            let connection;
            // O try/finally fica MUITO menor
            try {
                // 1. Pega uma conexão
                connection = yield (0, db_1.getConn)();
                // 2. VERIFICAR DUPLICIDADE
                const checkEmailSql = `SELECT 1 FROM logins WHERE email = :email`;
                const emailResult = yield connection.execute(checkEmailSql, [email]);
                if (emailResult.rows && emailResult.rows.length > 0) {
                    throw new Error('Este e-mail já está em uso.');
                }
                // 3. HASH DA SENHA (Isto é obrigatório, veja abaixo)
                const senhaHash = yield bcrypt.hash(senha, 8);
                // 4. GERAR IDs
                const loginId = (0, crypto_1.randomUUID)();
                const docenteId = (0, crypto_1.randomUUID)();
                // 5. SQL - Inserir na tabela 'logins' (com autoCommit)
                const insertLoginSql = `
        INSERT INTO logins (id, email, senha) 
        VALUES (:id, :email, :senha)
      `;
                yield connection.execute(insertLoginSql, {
                    id: loginId,
                    email: email,
                    senha: senhaHash
                }, { autoCommit: true }); // <-- MUDANÇA: autoCommit=true
                // 6. SQL - Inserir na tabela 'docentes' (com autoCommit)
                const insertDocenteSql = `
        INSERT INTO docentes (id, nome, telefone, login_id) 
        VALUES (:id, :nome, :telefone, :login_id)
      `;
                yield connection.execute(insertDocenteSql, {
                    id: docenteId,
                    nome: nome,
                    telefone: telefone,
                    login_id: loginId
                }, { autoCommit: true }); // <-- MUDANÇA: autoCommit=true
                // 7. Retorna os dados para o controller
                return { id: docenteId, nome, telefone, email };
            }
            catch (error) {
                // 8. Se deu erro, só lança para o controller
                throw error;
            }
            finally {
                // 9. DEVOLVE A CONEXÃO
                if (connection) {
                    try {
                        yield connection.close(); // Devolve a conexão ao pool
                    }
                    catch (err) {
                        console.error("Erro ao devolver conexão ao pool", err);
                    }
                }
            }
        });
    }
    /**
     * REQUISITO 3.1: Autenticação (Login)
     * (Este método já era simples e pode continuar igual)
     */
    realizarLogin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, senha }) {
            let connection;
            try {
                // 1. Pega conexão
                connection = yield (0, db_1.getConn)();
                // 2. Procura o LOGIN
                const sqlLogin = `SELECT id, email, senha FROM logins WHERE email = :email`;
                const resultLogin = yield connection.execute(sqlLogin, [email]);
                if (!resultLogin.rows || resultLogin.rows.length === 0) {
                    throw new Error('E-mail ou senha inválidos.');
                }
                const loginDoBanco = resultLogin.rows[0];
                const hashDaSenha = loginDoBanco.SENHA;
                // 3. COMPARA A SENHA (Obrigatório)
                const senhaValida = yield bcrypt.compare(senha, hashDaSenha);
                if (!senhaValida) {
                    throw new Error('E-mail ou senha inválidos.');
                }
                // 4. Busca o DOCENTE
                const sqlDocente = `SELECT id, nome, telefone FROM docentes WHERE login_id = :loginId`;
                const resultDocente = yield connection.execute(sqlDocente, [loginDoBanco.ID]);
                if (!resultDocente.rows || resultDocente.rows.length === 0) {
                    throw new Error('Perfil do docente não encontrado.');
                }
                const docente = resultDocente.rows[0];
                // 5. CRIA O "CRACHÁ" (Obrigatório)
                const secret = process.env.JWT_SECRET;
                if (!secret)
                    throw new Error('Chave JWT_SECRET não configurada no .env');
                const token = jwt.sign({ docenteId: docente.ID, email: loginDoBanco.EMAIL }, secret, { expiresIn: '1d' } // Expira em 1 dia
                );
                return {
                    docente: { id: docente.ID, nome: docente.NOME, email: loginDoBanco.EMAIL },
                    token
                };
            }
            catch (error) {
                throw error;
            }
            finally {
                if (connection) {
                    try {
                        yield connection.close();
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            }
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map