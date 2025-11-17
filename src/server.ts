// Feito por Sophia :)

import 'dotenv/config'; 
import app from './app'; 
import { initPool } from './config/db';

// Define a porta do servidor, usando a variável de ambiente PORT ou 3333 como padrão.
const PORT = process.env.PORT || 3333;

/**
 * Função para iniciar o servidor.
 * Inicializa o pool de conexão com o banco de dados e inicia o servidor Express.
 */
const startServer = async () => {
  try {
    // Inicializa o pool de conexão com o banco de dados Oracle.
    await initPool();
    
    // Inicia o servidor Express na porta definida.
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    // Em caso de erro ao iniciar o servidor, exibe uma mensagem de erro e encerra o processo.
    console.error('❌ Falha ao iniciar o servidor. O pool do Oracle conectou?', error);
    process.exit(1); 
  }
};

// Chama a função para iniciar o servidor.
startServer();
