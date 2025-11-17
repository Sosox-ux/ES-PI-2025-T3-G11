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
exports.TurmasController = void 0;
const turmas_service_1 = require("./turmas.service");
class TurmasController {
    constructor() {
        this.service = new turmas_service_1.TurmasService();
    }
    criar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nome, codigo, apelido, idInstituicao, idDisciplina } = req.body;
                const docenteId = req.docenteId;
                if (!nome || !idInstituicao || !idDisciplina || !docenteId) {
                    return res.status(400).json({ error: 'Nome, Instituição e Disciplina são obrigatórios.' });
                }
                const turma = yield this.service.criar({
                    nome,
                    codigo,
                    apelido,
                    idInstituicao: Number(idInstituicao),
                    idDisciplina: Number(idDisciplina),
                    docenteId
                });
                return res.status(201).json(turma);
            }
            catch (error) {
                if (error instanceof Error && error.message.includes("permissão")) {
                    return res.status(403).json({ error: error.message });
                }
                console.error(error);
                return res.status(500).json({ error: 'Erro ao criar turma.' });
            }
        });
    }
    listarPorInstituicao(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idInstituicao } = req.params;
                const docenteId = req.docenteId;
                const turmas = yield this.service.listarPorInstituicao(Number(idInstituicao), docenteId);
                return res.json(turmas);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao listar turmas.' });
            }
        });
    }
    listarPorDocente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const docenteId = req.docenteId;
                const turmas = yield this.service.listarPorDocente(docenteId);
                return res.json(turmas);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao listar turmas.' });
            }
        });
    }
    atualizar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { nome, codigo, apelido } = req.body;
                const docenteId = req.docenteId;
                const turma = yield this.service.atualizar({
                    id: Number(id),
                    nome,
                    codigo,
                    apelido,
                    docenteId
                });
                return res.json(turma);
            }
            catch (error) {
                if (error instanceof Error && error.message.includes("não encontrada")) {
                    return res.status(404).json({ error: error.message });
                }
                console.error(error);
                return res.status(500).json({ error: 'Erro ao atualizar turma.' });
            }
        });
    }
    deletar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const docenteId = req.docenteId;
                yield this.service.deletar(Number(id), docenteId);
                return res.status(204).send();
            }
            catch (error) {
                if (error instanceof Error && error.message.includes("não encontrada")) {
                    return res.status(404).json({ error: error.message });
                }
                if (error instanceof Error && error.message.includes("Não é possível deletar")) {
                    return res.status(409).json({ error: error.message });
                }
                console.error(error);
                return res.status(500).json({ error: 'Erro ao deletar turma.' });
            }
        });
    }
}
exports.TurmasController = TurmasController;
//# sourceMappingURL=turmas.controller.js.map