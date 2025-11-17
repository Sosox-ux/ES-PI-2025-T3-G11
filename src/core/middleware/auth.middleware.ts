// Feito por Sophia :)

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Estende a interface Request do Express para incluir a propriedade 'docenteId'.
declare global {
  namespace Express {
    interface Request {
      docenteId?: string;
    }
  }
}

/**
 * Middleware de autenticação.
 * Verifica a presença e validade de um token JWT no cabeçalho da requisição.
 * Se o token for válido, decodifica o ID do docente e o anexa ao objeto de requisição.
 * @param req Objeto de requisição do Express.
 * @param res Objeto de resposta do Express.
 * @param next Função para passar o controle para o próximo middleware.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  
  // Obtém o cabeçalho de autorização da requisição.
  const authHeader = req.headers.authorization;

  // Se o cabeçalho de autorização não for fornecido, retorna erro 401.
  if (!authHeader) {
    return res.status(401).json({ error: 'Nenhum token fornecido.' });
  }

  // Divide o cabeçalho para separar o esquema (Bearer) do token.
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token em formato inválido.' });
  }

  const [scheme, token] = parts;

  // Verifica se o esquema é "Bearer".
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado.' });
  }

  // Obtém a chave secreta JWT das variáveis de ambiente.
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'JWT Secret não configurado no servidor.' });
  }

  // Tenta verificar e decodificar o token JWT.
  try {
    const decoded = jwt.verify(token, secret) as { docenteId: string };
    // Anexa o ID do docente decodificado ao objeto de requisição.
    req.docenteId = decoded.docenteId; 
    
    // Passa o controle para o próximo middleware ou rota.
    return next(); 

  } catch (err) {
    // Se o token for inválido ou expirado, retorna erro 401.
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};
