import 'dotenv/config';
import 'reflect-metadata'; 
import { createConnection } from 'typeorm';

const {
  ORACLE_HOST,
  ORACLE_PORT,
  ORACLE_SERVICE,
  ORACLE_USER,
  ORACLE_PASSWORD
} = process.env;

const connectString = `${ORACLE_HOST}:${ORACLE_PORT}/${ORACLE_SERVICE}`;

export const connectDatabase = async () => {
  try {
    await createConnection({
      type: 'oracle', 
      username: ORACLE_USER,
      password: ORACLE_PASSWORD,
      connectString: connectString, 

      
      entities: [
        __dirname + '/../core/entities/*.{js,ts}'
      ],

      synchronize: true, 
      
    });
    
    console.log('Conectado ao Banco de Dados Oracle com sucesso!');
  
  } catch (error) {
    console.error('Erro ao conectar com o Banco de Dados:', error);
    throw error; 
  }
};