// Feito por Sophia :)

import { getConn } from '../../config/db';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { enviarEmailReset } from '../../core/service/email.service';

/**
 * Interface para os dados necessários na criação de uma conta de docente.
 */
interface CriarConta {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
}

/**
 * Interface para os dados necessários no login de um docente.
 */
interface Login {
  email: string;
  senha: string;
}

/**
 * Serviço de autenticação: contém a lógica de negócios para registro, login,
 * geração e redefinição de senhas.
 */
export class AuthService {
  /**
   * Método para logout (não implementado).
   * @param refreshToken Token de refresh.
   */
  logout(refreshToken: any) {
    throw new Error('Method not implemented.');
  }

  /**
   * Cria uma nova conta de docente.
   * Verifica se o e-mail já está em uso, faz o hash da senha e insere os dados no banco.
   * @param {CriarConta} data - Dados do novo docente (nome, email, telefone, senha).
   * @returns {Promise<object>} Dados do docente criado (sem a senha).
   * @throws {Error} Se o e-mail já estiver em uso ou ocorrer um erro no banco de dados.
   */
  public async criarConta({ nome, email, telefone, senha }: CriarConta) {
    
    let connection; 
    try {
      connection = await getConn();

      // Verifica se o e-mail já está cadastrado.
      const checkEmailSql = `SELECT 1 FROM DOCENTE WHERE EMAIL = :email`;
      const emailResult = await connection.execute(checkEmailSql, [email]);

      if (emailResult.rows && emailResult.rows.length > 0) {
        throw new Error('Este e-mail já está em uso.');
      }

      // Gera o hash da senha antes de salvar no banco.
      const senhaHash = await bcrypt.hash(senha, 8);

      // Insere os dados do novo docente na tabela DOCENTE.
      const insertSql = `
        INSERT INTO DOCENTE (NOME, EMAIL, TELEFONE_CELULAR, SENHA_HASH) 
        VALUES (:nome, :email, :telefone, :senhaHash)
      `;
      
      await connection.execute(insertSql, {
        nome: nome,
        email: email,
        telefone: telefone,
        senhaHash: senhaHash 
      }, { autoCommit: true }); 

      // Retorna os dados do docente, excluindo a senha.
      return { nome, email, telefone };

    } catch (error) {
      throw error; 
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }

  /**
   * Realiza o login de um docente.
   * Busca o docente pelo e-mail, compara a senha fornecida com o hash salvo e gera um token JWT.
   * @param {Login} credentials - Credenciais do docente (email, senha).
   * @returns {Promise<object>} Objeto contendo os dados do docente e o token JWT.
   * @throws {Error} Se o e-mail ou senha forem inválidos, ou se a chave JWT_SECRET não estiver configurada.
   */
  public async realizarLogin({ email, senha }: Login) {
    
    let connection;
    try {
      connection = await getConn();

      // Busca o docente no banco de dados pelo e-mail.
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
      const hashDaSenha = docente.SENHA_HASH; 

      // Compara a senha fornecida com o hash da senha armazenado.
      const senhaValida = await bcrypt.compare(senha, hashDaSenha);
      if (!senhaValida) {
        throw new Error('E-mail ou senha inválidos.');
      }

      // Gera um token JWT para o docente autenticado.
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('Chave JWT_SECRET não configurada no .env');

      const token = jwt.sign(
        { 
          docenteId: docente.ID_DOCENTE, 
          email: docente.EMAIL
        },
        secret,
        { expiresIn: '1d' }
      );

      // Retorna os dados do docente e o token.
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

  /**
   * Gera um código de recuperação de senha e o envia por e-mail.
   * Salva o código e a data de expiração no banco de dados.
   * Por segurança, não informa se o e-mail não está cadastrado.
   * @param {string} email - E-mail do docente.
   * @returns {Promise<void>}
   * @throws {Error} Se ocorrer um erro no banco de dados ou no envio do e-mail.
   */
  public async gerarCodigoReset(email: string) {
    let connection;
    try {
      connection = await getConn();

      // 1. Verifica se o docente existe.
      const sqlFind = `SELECT ID_DOCENTE FROM DOCENTE WHERE EMAIL = :email`;
      const resultFind = await connection.execute(sqlFind, [email]);

      if (!resultFind.rows || resultFind.rows.length === 0) {
        // Docente não encontrado. Retorna sem erro por segurança.
        return; 
      }
      
      // 2. Gera um código aleatório de 6 dígitos.
      const codigo = Math.floor(100000 + Math.random() * 900000).toString();

      // 3. Define a data de expiração (15 minutos).
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

      // 4. Salva o código e a data de expiração no banco.
      const sqlUpdate = `
        UPDATE DOCENTE 
        SET RESET_CODE = :codigo, RESET_EXPIRES_AT = :expiresAt
        WHERE EMAIL = :email
      `;
      await connection.execute(sqlUpdate, 
        { codigo, expiresAt, email },
        { autoCommit: true }
      );

      // 5. Envia o e-mail com o código de recuperação.
      await enviarEmailReset(email, codigo);

    } catch (error) {
      console.error(error);
      throw error; 
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }

  /**
   * Redefine a senha de um docente utilizando um código de recuperação.
   * Verifica a validade do código e sua expiração antes de atualizar a senha.
   * @param {string} email - E-mail do docente.
   * @param {string} codigo - Código de recuperação fornecido.
   * @param {string} novaSenha - Nova senha a ser definida.
   * @returns {Promise<object>} Mensagem de sucesso.
   * @throws {Error} Se o código for inválido ou expirado.
   */
  public async resetarSenha(email: string, codigo: string, novaSenha: string) {
    let connection;
    try {
      connection = await getConn();

      // 1. Procura o docente pelo e-mail e código, verificando se o código não expirou.
      const sqlFind = `
        SELECT ID_DOCENTE 
        FROM DOCENTE 
        WHERE EMAIL = :email 
          AND RESET_CODE = :codigo 
          AND RESET_EXPIRES_AT > SYSTIMESTAMP
      `;
      const resultFind = await connection.execute(sqlFind, { email, codigo });

      if (!resultFind.rows || resultFind.rows.length === 0) {
        throw new Error('Código inválido ou expirado.');
      }
      
      // 2. Gera o hash da nova senha.
      const novaSenhaHash = await bcrypt.hash(novaSenha, 8);

      // 3. Atualiza a senha e invalida o código de recuperação.
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

      return { message: 'Senha resetada com sucesso' };

    } catch (error) {
      console.error(error);
      throw error; 
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }
}
