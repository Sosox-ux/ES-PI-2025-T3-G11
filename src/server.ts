import 'dotenv/config'; 
import app from './app'; 
import { initPool } from './config/db';

const PORT = process.env.PORT || 3333;

const startServer = async () => {
  try {
    await initPool();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Falha ao iniciar o servidor. O pool do Oracle conectou?', error);
    process.exit(1); 
  }
};

startServer();