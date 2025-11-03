import express, { Application } from 'express';
import cors from 'cors';
import 'reflect-metadata';
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
    this.server.use(express.static('public')); 
  }

  private routes(): void {
    this.server.use('/api/v1', unifiedRoutes); 
  }
}

export default new App().server;