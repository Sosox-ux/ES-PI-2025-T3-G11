import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { unifiedRoutes } from './api/routes'; 

class App {
  public server: Application; 

  constructor() {
    this.server = express();
    this.middlewares(); 
    this.routes();      
  }

  private middlewares(): void {
    this.server.use(express.json()); 
    
    this.server.use(cors()); 

  
    this.server.use(
      express.static(path.join(__dirname, '..', 'public'))
    );
  }

  private routes(): void {

    this.server.use('/api/v1', unifiedRoutes); 

    this.server.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', 'inicio.html'));
    });
  }
}

export default new App().server;