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

  async pedirCodigoReset(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'O e-mail é obrigatório.' });
    }

    try {
      await this.authService.gerarCodigoReset(email);
      // **IMPORTANTE (Segurança):** Sempre retorne sucesso, mesmo se o e-mail não existir.
      // Isso impede que hackers "adivinhem" e-mails cadastrados.
      return res.json({ message: 'Se o e-mail estiver cadastrado, um código de recuperação foi enviado.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
    }
  }

  /**
   * Controlador para RESETAR A SENHA
   */
  async resetarSenha(req: Request, res: Response) {
    const { email, codigo, novaSenha } = req.body;
    
    if (!email || !codigo || !novaSenha) {
      return res.status(400).json({ error: 'E-mail, código e nova senha são obrigatórios.' });
    }

    try {
      await this.authService.resetarSenha(email, codigo, novaSenha);
      return res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
      // Trata erros específicos do Service
      if (error instanceof Error) {
        if (error.message === 'Código inválido ou expirado.') {
          return res.status(400).json({ error: error.message });
        }
      }
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao resetar a senha.' });
    }
  }
}
