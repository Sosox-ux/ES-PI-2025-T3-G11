import oracledb from "oracledb";
import "dotenv/config";

const {
  ORACLE_HOST,
  ORACLE_PORT,
  ORACLE_SERVICE,
  ORACLE_USER,
  ORACLE_PASSWORD
} = process.env;

const connectString = `${ORACLE_HOST}:${ORACLE_PORT}/${ORACLE_SERVICE}`;

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

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

export async function getConn() {
  return oracledb.getConnection(); 
}

