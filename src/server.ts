import 'dotenv/config'; // 1. Garante que o .env seja lido PRIMEIRO
import app from './app'; // 2. Importa o "motor" (toda a configuração do Express)
import { connectDatabase } from './config/db'; // 3. Importa o conector do banco

const PORT = process.env.PORT || 3333;

const startServer = async () => {
  try {
    await connectDatabase(); 
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Frontend disponível em http://localhost:${PORT}/login.html`);
    });
  } catch (error) {
    console.error('Falha ao iniciar o servidor.', error);
    process.exit(1); 
  }
};

startServer();