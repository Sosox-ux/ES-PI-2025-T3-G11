// Feito por Carlos Eduardo

import oracledb from "oracledb";
import "dotenv/config";

// Desestrutura as variáveis de ambiente necessárias para a conexão com o Oracle.
const {
  ORACLE_HOST,
  ORACLE_PORT,
  ORACLE_SERVICE,
  ORACLE_USER,
  ORACLE_PASSWORD
} = process.env;

// Constrói a string de conexão com base nas variáveis de ambiente.
const connectString = `${ORACLE_HOST}:${ORACLE_PORT}/${ORACLE_SERVICE}`;

// Configura o formato de saída das consultas do Oracle para objetos.
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/**
 * Inicializa o pool de conexões com o banco de dados Oracle.
 * Configura o número mínimo, máximo e incremento de conexões no pool.
 */
export async function initPool() {
  console.log("Iniciando pool de conexões com o Oracle...");
  await oracledb.createPool({
    user: ORACLE_USER,
    password: ORACLE_PASSWORD,
    connectString,
    poolMin: 1,
    poolMax: 10,
    poolIncrement: 1
  });
  console.log("Pool de conexões iniciado.");
}

/**
 * Obtém uma conexão do pool de conexões do Oracle.
 * @returns {Promise<oracledb.Connection>} Uma conexão ativa com o banco de dados.
 */
export async function getConn() {
  return oracledb.getConnection(); 
}
