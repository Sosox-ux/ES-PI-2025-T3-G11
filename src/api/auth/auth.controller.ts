import { Request, Response } from 'express';
import { AuthService } from './auth.service'; 

export class AuthController {
  
  private authService: AuthService;

  constructor() {
    // Instancia o Service para poder usá-lo
    this.authService = new AuthService();
  }

  /**
   * Controlador para CRIAR CONTA (Register)
   */
  async criarConta(req: Request, res: Response) {
    
    // 1. Pega os dados do frontend (que vieram no 'body' da requisição)
    // (Isso é o que seu 'cadastro.js' envia)
    const { nome, email, telefone, senha } = req.body;

    // 2. Validação simples de campos obrigatórios
    if (!nome || !email || !telefone || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
      const novoDocente = await this.authService.criarConta({ 
        nome, 
        email, 
        telefone, 
        senha 
      });


      return res.status(201).json(novoDocente);

    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Este e-mail já está em uso.') {
          return res.status(400).json({ error: error.message });
        }
      }
      console.error(error); 
      return res.status(500).json({ error: 'Erro interno ao criar conta.' });
    }
  }


  async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
      const resultadoLogin = await this.authService.realizarLogin({ email, senha });
      
      return res.json(resultadoLogin);

    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'E-mail ou senha inválidos.') {
          return res.status(401).json({ error: error.message }); 
        }
      }
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao fazer login.' });
    }
  }
}