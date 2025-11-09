import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// adiciona o campo 'docenteId' ao 'Request' do Express
declare global {
  namespace Express {
    interface Request {
      docenteId?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  
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
    const decoded = jwt.verify(token, secret) as { docenteId: string };
    req.docenteId = decoded.docenteId; 
    
    // deixa a requisição passar para o controller
    return next(); 

  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};