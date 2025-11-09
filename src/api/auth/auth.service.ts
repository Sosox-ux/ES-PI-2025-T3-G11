import { getConn } from '../../config/db';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { enviarEmailReset } from '../../core/service/email.service';

interface CriarConta {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
}

interface Login {
  email: string;
  senha: string;
}

export class AuthService {

  public async criarConta({ nome, email, telefone, senha }: CriarConta) {
    
    let connection; 
    try {
      connection = await getConn();

      // verifica se tem igual
      const checkEmailSql = `SELECT 1 FROM DOCENTE WHERE EMAIL = :email`;
      const emailResult = await connection.execute(checkEmailSql, [email]);

      if (emailResult.rows && emailResult.rows.length > 0) {
        throw new Error('Este e-mail já está em uso.');
      }

      // hash a senha
      const senhaHash = await bcrypt.hash(senha, 8);

      // insere na tabela
      const insertSql = `
        INSERT INTO DOCENTE (NOME, EMAIL, TELEFONE_CELULAR, SENHA_HASH) 
        VALUES (:nome, :email, :telefone, :senhaHash)
      `;
      
      await connection.execute(insertSql, {
        nome: nome,
        email: email,
        telefone: telefone,
        senhaHash: senhaHash // salva o hash
      }, { autoCommit: true }); 

      // retorna os dados (sem a senha)
      return { nome, email, telefone };

    } catch (error) {
      throw error; 
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }

  public async realizarLogin({ email, senha }: Login) {
    
    let connection;
    try {
      connection = await getConn();

      // busca docente pelo e-mail
      const sql = `
        SELECT ID_DOCENTE, NOME, EMAIL, TELEFONE_CELULAR, SENHA_HASH 
        FROM DOCENTE 
        WHERE EMAIL = :email
      `;
      const result = await connection.execute(sql, [email]);

      if (!result.rows || result.rows.length === 0) {
        throw new Error('E-mail ou senha inválidos.'); 
      }
      
      const docente = result.rows[0] as any;
      const hashDaSenha = docente.SENHA_HASH; // Oracle retorna maiúsculo

      // compara a senha
      const senhaValida = await bcrypt.compare(senha, hashDaSenha);
      if (!senhaValida) {
        throw new Error('E-mail ou senha inválidos.');
      }

      // cria o token 
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('Chave JWT_SECRET não configurada no .env');

      const token = jwt.sign(
        { 
          docenteId: docente.ID_DOCENTE, // salva o id do docente no crachazinho
          email: docente.EMAIL
        },
        secret,
        { expiresIn: '1d' }
      );

      // retorna o dados
      return {
        docente: {
          id: docente.ID_DOCENTE,
          nome: docente.NOME,
          email: docente.EMAIL,
          telefone: docente.TELEFONE_CELULAR
        },
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

  public async gerarCodigoReset(email: string) {
    let connection;
    try {
      connection = await getConn();

      // 1. Verifica se o docente existe
      const sqlFind = `SELECT ID_DOCENTE FROM DOCENTE WHERE EMAIL = :email`;
      const resultFind = await connection.execute(sqlFind, [email]);

      if (!resultFind.rows || resultFind.rows.length === 0) {
        // Docente não encontrado.
        // NÃO retorne um erro (por segurança). Apenas saia da função.
        return; 
      }
      
      // 2. Gera um código aleatório de 6 dígitos
      const codigo = Math.floor(100000 + Math.random() * 900000).toString();

      // 3. Define a data de expiração (15 minutos a partir de agora)
      // (O Oracle entende o objeto Date do JS)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      // 4. Salva o código e a data no banco
      const sqlUpdate = `
        UPDATE DOCENTE 
        SET RESET_CODE = :codigo, RESET_EXPIRES_AT = :expiresAt
        WHERE EMAIL = :email
      `;
      await connection.execute(sqlUpdate, 
        { codigo, expiresAt, email },
        { autoCommit: true }
      );

      // 5. Envia o e-mail (usando o serviço que criamos)
      await enviarEmailReset(email, codigo);

    } catch (error) {
      console.error(error);
      throw error; // Lança o erro para o Controller
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }

  /**
   * Fase 3: Reseta a senha se o código estiver correto
   */
  public async resetarSenha(email: string, codigo: string, novaSenha: string) {
    let connection;
    try {
      connection = await getConn();

      // 1. Procura o docente PELO CÓDIGO e E-MAIL
      // E verifica se o código NÃO EXPIROU (SYSTIMESTAMP é o "agora" do Oracle)
      const sqlFind = `
        SELECT ID_DOCENTE 
        FROM DOCENTE 
        WHERE EMAIL = :email 
          AND RESET_CODE = :codigo 
          AND RESET_EXPIRES_AT > SYSTIMESTAMP
      `;
      const resultFind = await connection.execute(sqlFind, { email, codigo });

      // Se não achou, o código está errado ou expirou
      if (!resultFind.rows || resultFind.rows.length === 0) {
        throw new Error('Código inválido ou expirado.');
      }
      
      // 2. Se o código foi válido, hash a nova senha
      const novaSenhaHash = await bcrypt.hash(novaSenha, 8);

      // 3. Atualiza a senha e "queima" o código (setando-o para NULL)
      const sqlUpdate = `
        UPDATE DOCENTE
        SET SENHA_HASH = :novaSenhaHash,
            RESET_CODE = NULL,
            RESET_EXPIRES_AT = NULL
        WHERE EMAIL = :email
      `;
      await connection.execute(sqlUpdate, 
        { novaSenhaHash, email },
        { autoCommit: true }
      );

      // Se chegou aqui, tudo deu certo
      return { message: 'Senha resetada com sucesso' };

    } catch (error) {
      console.error(error);
      throw error; // Lança o erro para o Controller
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }
}
