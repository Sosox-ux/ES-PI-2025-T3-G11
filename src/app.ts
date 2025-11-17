// Feito por Sophia :)

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { unifiedRoutes } from './api/routes'; 

/**
 * Classe principal da aplicação.
 * Configura o servidor Express, middlewares e rotas.
 */
class App {
  public server: Application; 

  /**
   * Construtor da classe App.
   * Inicializa o servidor Express e configura os middlewares e rotas.
   */
  constructor() {
    this.server = express();
    this.middlewares(); 
    this.routes();      
  }

  /**
   * Configura os middlewares da aplicação.
   * Inclui parsing de JSON, CORS e servir arquivos estáticos.
   */
  private middlewares(): void {
    this.server.use(express.json()); // Habilita o parsing de JSON para requisições.
    
    this.server.use(cors()); // Habilita o CORS para permitir requisições de diferentes origens.

    // Serve arquivos estáticos da pasta 'public'.
    this.server.use(
      express.static(path.join(__dirname, '..', 'public'))
    );
  }

  /**
   * Configura as rotas da aplicação.
   * Inclui rotas da API e uma rota para a página inicial.
   */
  private routes(): void {
    // Usa as rotas unificadas da API sob o prefixo '/api/v1'.
    this.server.use('/api/v1', unifiedRoutes); 

    // Rota para a página inicial, servindo o arquivo 'inicio.html'.
    this.server.get('/', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '..', 'public', 'inicio.html'));
    });
  }
}

// Exporta a instância do servidor Express.
export default new App().server;
