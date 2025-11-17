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
exports.InstituicoesController = void 0;
const instituicoes_service_1 = require("./instituicoes.service");
class InstituicoesController {
    constructor() {
        this.service = new instituicoes_service_1.InstituicoesService();
    }
    criar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nome, local } = req.body;
                const docenteId = req.docenteId;
                if (!nome || !docenteId) {
                    return res.status(400).json({ error: 'Nome é obrigatório.' });
                }
                const instituicao = yield this.service.criar({ nome, local, docenteId });
                return res.status(201).json(instituicao);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao criar instituição.' });
            }
        });
    }
    /**
     * READ (Listar)
     */
    listar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const docenteId = req.docenteId; // O '!' diz ao TS "confie, o middleware garantiu"
                const instituicoes = yield this.service.listar(docenteId);
                return res.json(instituicoes); // Retorna a lista
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao listar instituições.' });
            }
        });
    }
    /**
     * DELETE (Deletar)
     */
    deletar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params; // Pega o ID da URL
                const docenteId = req.docenteId;
                yield this.service.deletar({ id: Number(id), docenteId });
                // 204 = "No Content" (Sucesso, mas não retorna nada no corpo)
                return res.status(204).send();
            }
            catch (error) {
                console.error(error);
                if (error instanceof Error && error.message.includes("não encontrada")) {
                    return res.status(404).json({ error: error.message });
                }
                // Se o erro for de constraint (ex: ORA-02292), o Oracle vai proibir
                // deletar uma instituição que tem disciplinas. Isso é o correto!
                return res.status(500).json({ error: 'Erro ao deletar instituição. Verifique se ela possui disciplinas.' });
            }
        });
    }
}
exports.InstituicoesController = InstituicoesController;
//# sourceMappingURL=instituicoes.controller.js.map