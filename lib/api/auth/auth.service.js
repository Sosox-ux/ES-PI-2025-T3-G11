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
const email_service_1 = require("../../core/service/email.service");
class AuthService {
    criarConta(_a) {
        return __awaiter(this, arguments, void 0, function* ({ nome, email, telefone, senha }) {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                // verifica se tem igual
                const checkEmailSql = `SELECT 1 FROM DOCENTE WHERE EMAIL = :email`;
                const emailResult = yield connection.execute(checkEmailSql, [email]);
                if (emailResult.rows && emailResult.rows.length > 0) {
                    throw new Error('Este e-mail já está em uso.');
                }
                // hash a senha
                const senhaHash = yield bcrypt.hash(senha, 8);
                // insere na tabela
                const insertSql = `
        INSERT INTO DOCENTE (NOME, EMAIL, TELEFONE_CELULAR, SENHA_HASH) 
        VALUES (:nome, :email, :telefone, :senhaHash)
      `;
                yield connection.execute(insertSql, {
                    nome: nome,
                    email: email,
                    telefone: telefone,
                    senhaHash: senhaHash // salva o hash
                }, { autoCommit: true });
                // retorna os dados (sem a senha)
                return { nome, email, telefone };
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
    realizarLogin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, senha }) {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                // busca docente pelo e-mail
                const sql = `
        SELECT ID_DOCENTE, NOME, EMAIL, TELEFONE_CELULAR, SENHA_HASH 
        FROM DOCENTE 
        WHERE EMAIL = :email
      `;
                const result = yield connection.execute(sql, [email]);
                if (!result.rows || result.rows.length === 0) {
                    throw new Error('E-mail ou senha inválidos.');
                }
                const docente = result.rows[0];
                const hashDaSenha = docente.SENHA_HASH; // Oracle retorna maiúsculo
                // compara a senha
                const senhaValida = yield bcrypt.compare(senha, hashDaSenha);
                if (!senhaValida) {
                    throw new Error('E-mail ou senha inválidos.');
                }
                // cria o token 
                const secret = process.env.JWT_SECRET;
                if (!secret)
                    throw new Error('Chave JWT_SECRET não configurada no .env');
                const token = jwt.sign({
                    docenteId: docente.ID_DOCENTE, // salva o id do docente no crachazinho
                    email: docente.EMAIL
                }, secret, { expiresIn: '1d' });
                // retorna o dados
                return {
                    docente: {
                        id: docente.ID_DOCENTE,
                        nome: docente.NOME,
                        email: docente.EMAIL,
                        telefone: docente.TELEFONE_CELULAR
                    },
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
    gerarCodigoReset(email) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                // 1. Verifica se o docente existe
                const sqlFind = `SELECT ID_DOCENTE FROM DOCENTE WHERE EMAIL = :email`;
                const resultFind = yield connection.execute(sqlFind, [email]);
                if (!resultFind.rows || resultFind.rows.length === 0) {
                    // Docente não encontrado.
                    // NÃO retorne um erro (por segurança). Apenas saia da função.
                    return;
                }
                // 2. Gera um código aleatório de 6 dígitos
                const codigo = Math.floor(100000 + Math.random() * 900000).toString();
                // 3. Define a data de expiração (15 minutos a partir de agora)
                // (O Oracle entende o objeto Date do JS)
                const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
                // 4. Salva o código e a data no banco
                const sqlUpdate = `
        UPDATE DOCENTE 
        SET RESET_CODE = :codigo, RESET_EXPIRES_AT = :expiresAt
        WHERE EMAIL = :email
      `;
                yield connection.execute(sqlUpdate, { codigo, expiresAt, email }, { autoCommit: true });
                // 5. Envia o e-mail (usando o serviço que criamos)
                yield (0, email_service_1.enviarEmailReset)(email, codigo);
            }
            catch (error) {
                console.error(error);
                throw error; // Lança o erro para o Controller
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
    /**
     * Fase 3: Reseta a senha se o código estiver correto
     */
    resetarSenha(email, codigo, novaSenha) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield (0, db_1.getConn)();
                // 1. Procura o docente PELO CÓDIGO e E-MAIL
                // E verifica se o código NÃO EXPIROU (SYSTIMESTAMP é o "agora" do Oracle)
                const sqlFind = `
        SELECT ID_DOCENTE 
        FROM DOCENTE 
        WHERE EMAIL = :email 
          AND RESET_CODE = :codigo 
          AND RESET_EXPIRES_AT > SYSTIMESTAMP
      `;
                const resultFind = yield connection.execute(sqlFind, { email, codigo });
                // Se não achou, o código está errado ou expirou
                if (!resultFind.rows || resultFind.rows.length === 0) {
                    throw new Error('Código inválido ou expirado.');
                }
                // 2. Se o código foi válido, hash a nova senha
                const novaSenhaHash = yield bcrypt.hash(novaSenha, 8);
                // 3. Atualiza a senha e "queima" o código (setando-o para NULL)
                const sqlUpdate = `
        UPDATE DOCENTE
        SET SENHA_HASH = :novaSenhaHash,
            RESET_CODE = NULL,
            RESET_EXPIRES_AT = NULL
        WHERE EMAIL = :email
      `;
                yield connection.execute(sqlUpdate, { novaSenhaHash, email }, { autoCommit: true });
                // Se chegou aqui, tudo deu certo
                return { message: 'Senha resetada com sucesso' };
            }
            catch (error) {
                console.error(error);
                throw error; // Lança o erro para o Controller
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