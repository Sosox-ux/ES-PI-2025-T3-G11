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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotasController = void 0;
const notas_service_1 = require("./notas.service");
class NotasController {
    constructor() {
        this.service = new notas_service_1.NotasService();
    }
    listarComponentes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idDisciplina } = req.params;
                const docenteId = req.docenteId;
                const componentes = yield this.service.listarComponentesPorDisciplina(Number(idDisciplina), docenteId);
                return res.json(componentes);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao listar componentes de nota.' });
            }
        });
    }
    listarGrid(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idTurma } = req.params;
                const docenteId = req.docenteId;
                const grid = yield this.service.listarNotasGridPorTurma(Number(idTurma), docenteId);
                return res.json(grid);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao carregar grade de notas.' });
            }
        });
    }
    salvarLote(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notas = req.body.notas; // Espera um array: [{ idInscricao, idComponente, valorNota }]
                const docenteId = req.docenteId;
                if (!Array.isArray(notas) || notas.length === 0) {
                    return res.status(400).json({ error: 'Corpo da requisição deve ser um array de notas.' });
                }
                const resultado = yield this.service.lancarOuAtualizarLote(notas, docenteId);
                return res.status(200).json(resultado);
            }
            catch (error) {
                if (error instanceof Error && error.message.includes("Permissão negada")) {
                    return res.status(403).json({ error: error.message });
                }
                console.error(error);
                return res.status(500).json({ error: 'Erro ao salvar notas.' });
            }
        });
    }
}
exports.NotasController = NotasController;
//# sourceMappingURL=notas.controller.js.map