// Feito por Sophia :)

import { Router } from 'express';
import { AuthController } from './auth.controller'; 

/**
 * Router para as rotas de autenticação.
 * Gerencia o registro de novos usuários, login, solicitação e redefinição de senha.
 */
const authRoutes = Router();

// Instância do controlador de autenticação para lidar com as requisições.
const controller = new AuthController();

/**
 * Rota para registrar um novo docente.
 * Espera os dados do novo usuário no corpo da requisição.
 */
authRoutes.post(
    '/register',
    (req, res) => controller.criarConta(req, res)
);

/**
 * Rota para realizar o login de um docente.
 * Espera e-mail e senha no corpo da requisição.
 */
authRoutes.post(
    '/login',
    (req, res) => controller.login(req, res)
);

/**
 * Rota para solicitar um código de recuperação de senha.
 * Espera o e-mail do usuário no corpo da requisição.
 */
authRoutes.post(
  '/forgot-password', 
  (req, res) => controller.pedirCodigoReset(req, res)
);

/**
 * Rota para redefinir a senha de um docente.
 * Espera e-mail, código de recuperação e a nova senha no corpo da requisição.
 */
authRoutes.post(
  '/reset-password', 
  (req, res) => controller.resetarSenha(req, res)
);

export { authRoutes };
