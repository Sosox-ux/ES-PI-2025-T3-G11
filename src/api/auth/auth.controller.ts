// Feito por Sophia :)

import { Request, Response } from 'express';
import { AuthService } from './auth.service'; 

/**
 * Controller responsável por gerenciar as operações de autenticação.
 * Inclui funcionalidades para criar conta, realizar login, solicitar e resetar senha.
 */
export class AuthController {
  
  private authService: AuthService;

  /**
   * Construtor da classe AuthController.
   * Inicializa o serviço de autenticação.
   */
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Lida com a criação de uma nova conta de docente.
   * Valida os dados de entrada e utiliza o serviço de autenticação para registrar o novo usuário.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async criarConta(req: Request, res: Response) {
    const { nome, email, telefone, senha } = req.body;

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

  /**
   * Lida com o processo de login de um docente.
   * Valida as credenciais e retorna um token de autenticação se o login for bem-sucedido.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
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

  /**
   * Solicita o envio de um código de recuperação de senha para o e-mail fornecido.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async pedirCodigoReset(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'O e-mail é obrigatório.' });
    }

    try {
      await this.authService.gerarCodigoReset(email);
      // Retorna sucesso mesmo se o e-mail não existir para evitar enumeração de usuários.
      return res.json({ message: 'Se o e-mail estiver cadastrado, um código de recuperação foi enviado.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
    }
  }

  /**
   * Reseta a senha de um docente utilizando um código de recuperação.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
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
