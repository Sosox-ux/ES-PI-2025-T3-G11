"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPool = initPool;
exports.getConn = getConn;
const oracledb_1 = __importDefault(require("oracledb"));
require("dotenv/config");
const { ORACLE_HOST, ORACLE_PORT, ORACLE_SERVICE, ORACLE_USER, ORACLE_PASSWORD } = process.env;
const connectString = `${ORACLE_HOST}:${ORACLE_PORT}/${ORACLE_SERVICE}`;
oracledb_1.default.outFormat = oracledb_1.default.OUT_FORMAT_OBJECT;
function initPool() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Iniciando pool de conexões com o Oracle...");
        yield oracledb_1.default.createPool({
            user: ORACLE_USER,
            password: ORACLE_PASSWORD,
            connectString,
            poolMin: 1,
            poolMax: 10,
            poolIncrement: 1
        });
        console.log("Pool de conexões iniciado.");
    });
}
function getConn() {
    return __awaiter(this, void 0, void 0, function* () {
        return oracledb_1.default.getConnection();
    });
}
//# sourceMappingURL=db.js.map