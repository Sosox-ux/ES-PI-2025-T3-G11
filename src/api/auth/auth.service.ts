import { getConn } from '../../config/db'; 
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

interface CriarContaDTO {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
}

interface LoginDTO {
  email: string;
  senha: string;
}

export class AuthService {


  public async criarConta({ nome, email, telefone, senha }: CriarContaDTO) {
    
    let connection; 
    
    // O try/finally fica MUITO menor
    try {
      // 1. Pega uma conexão
      connection = await getConn();

      // 2. VERIFICAR DUPLICIDADE
      const checkEmailSql = `SELECT 1 FROM logins WHERE email = :email`;
      const emailResult = await connection.execute(checkEmailSql, [email]);

      if (emailResult.rows && emailResult.rows.length > 0) {
        throw new Error('Este e-mail já está em uso.');
      }

      // 3. HASH DA SENHA (Isto é obrigatório, veja abaixo)
      const senhaHash = await bcrypt.hash(senha, 8);

      // 4. GERAR IDs
      const loginId = randomUUID();
      const docenteId = randomUUID();

      // 5. SQL - Inserir na tabela 'logins' (com autoCommit)
      const insertLoginSql = `
        INSERT INTO logins (id, email, senha) 
        VALUES (:id, :email, :senha)
      `;
      await connection.execute(insertLoginSql, {
        id: loginId,
        email: email,
        senha: senhaHash
      }, { autoCommit: true }); // <-- MUDANÇA: autoCommit=true

      // 6. SQL - Inserir na tabela 'docentes' (com autoCommit)
      const insertDocenteSql = `
        INSERT INTO docentes (id, nome, telefone, login_id) 
        VALUES (:id, :nome, :telefone, :login_id)
      `;
      await connection.execute(insertDocenteSql, {
        id: docenteId,
        nome: nome,
        telefone: telefone,
        login_id: loginId
      }, { autoCommit: true }); // <-- MUDANÇA: autoCommit=true

      // 7. Retorna os dados para o controller
      return { id: docenteId, nome, telefone, email };

    } catch (error) {
      // 8. Se deu erro, só lança para o controller
      throw error; 
    } finally {
      // 9. DEVOLVE A CONEXÃO
      if (connection) {
        try {
          await connection.close(); // Devolve a conexão ao pool
        } catch (err) {
          console.error("Erro ao devolver conexão ao pool", err);
        }
      }
    }
  }

  /**
   * REQUISITO 3.1: Autenticação (Login)
   * (Este método já era simples e pode continuar igual)
   */
  public async realizarLogin({ email, senha }: LoginDTO) {
    
    let connection;
    try {
      // 1. Pega conexão
      connection = await getConn();

      // 2. Procura o LOGIN
      const sqlLogin = `SELECT id, email, senha FROM logins WHERE email = :email`;
      const resultLogin = await connection.execute(sqlLogin, [email]);

      if (!resultLogin.rows || resultLogin.rows.length === 0) {
        throw new Error('E-mail ou senha inválidos.'); 
      }
      const loginDoBanco = resultLogin.rows[0] as any;
      const hashDaSenha = loginDoBanco.SENHA;

      // 3. COMPARA A SENHA (Obrigatório)
      const senhaValida = await bcrypt.compare(senha, hashDaSenha);
      if (!senhaValida) {
        throw new Error('E-mail ou senha inválidos.');
      }

      // 4. Busca o DOCENTE
      const sqlDocente = `SELECT id, nome, telefone FROM docentes WHERE login_id = :loginId`;
      const resultDocente = await connection.execute(sqlDocente, [loginDoBanco.ID]);
      if (!resultDocente.rows || resultDocente.rows.length === 0) {
        throw new Error('Perfil do docente não encontrado.'); 
      }
      const docente = resultDocente.rows[0] as any;

      // 5. CRIA O "CRACHÁ" (Obrigatório)
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('Chave JWT_SECRET não configurada no .env');

      const token = jwt.sign(
        { docenteId: docente.ID, email: loginDoBanco.EMAIL },
        secret,
        { expiresIn: '1d' } // Expira em 1 dia
      );

      return {
        docente: { id: docente.ID, nome: docente.NOME, email: loginDoBanco.EMAIL },
        token
      };
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }
}