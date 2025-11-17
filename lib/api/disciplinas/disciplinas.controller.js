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
exports.DisciplinasController = void 0;
const disciplinas_service_1 = require("./disciplinas.service");
class DisciplinasController {
    constructor() {
        this.service = new disciplinas_service_1.DisciplinasService();
    }
    /**
     * CREATE (Criar Disciplina)
     */
    criar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1. Pega os campos do BANCO DE DADOS
                // (Ignoramos 'idInstituicao' e 'cargaHoraria' do seu HTML)
                const { nome, sigla, codigo, periodo_curso } = req.body;
                const docenteId = req.docenteId; // Vem do authMiddleware
                if (!nome || !docenteId) {
                    return res.status(400).json({ error: 'Nome é obrigatório.' });
                }
                const disciplina = yield this.service.criar({
                    nome,
                    sigla,
                    codigo,
                    periodo_curso,
                    docenteId
                });
                return res.status(201).json(disciplina);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao criar disciplina.' });
            }
        });
    }
    /**
     * READ (Listar TODAS as Disciplinas do Docente)
     */
    listar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const docenteId = req.docenteId;
                const disciplinas = yield this.service.listar(docenteId);
                return res.json(disciplinas);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao listar disciplinas.' });
            }
        });
    }
    /**
     * DELETE (Deletar Disciplina)
     */
    deletar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const docenteId = req.docenteId;
                yield this.service.deletar(Number(id), docenteId);
                return res.status(204).send(); // Sucesso, sem conteúdo
            }
            catch (error) {
                if (error instanceof Error && error.message.includes("não encontrada")) {
                    return res.status(404).json({ error: error.message });
                }
                if (error instanceof Error && error.message.includes("Não é possível deletar")) {
                    return res.status(409).json({ error: error.message }); // 409 Conflict
                }
                console.error(error);
                return res.status(500).json({ error: 'Erro ao deletar disciplina.' });
            }
        });
    }
}
exports.DisciplinasController = DisciplinasController;
//# sourceMappingURL=disciplinas.controller.js.map