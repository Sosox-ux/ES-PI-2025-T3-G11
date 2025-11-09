import { Router } from 'express';
import { AuthController } from './auth.controller'; 

const authRoutes = Router();


const controller = new AuthController();


authRoutes.post(
    '/register',
    (req, res) => controller.criarConta(req, res)
);


authRoutes.post(
    '/login',
    (req, res) => controller.login(req, res)
);


authRoutes.post(
  '/forgot-password', 
  (req, res) => controller.pedirCodigoReset(req, res)
);


authRoutes.post(
  '/reset-password', 
  (req, res) => controller.resetarSenha(req, res)
);

export { authRoutes };