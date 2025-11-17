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
exports.AlunosController = void 0;
const aluno_service_1 = require("./aluno.service");
class AlunosController {
    constructor() {
        this.service = new aluno_service_1.AlunosService();
    }
    criarEInscrever(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nome, matricula, idInstituicao, idTurma } = req.body;
                const docenteId = req.docenteId;
                if (!nome || !matricula || !idInstituicao || !idTurma) {
                    return res.status(400).json({ error: 'Todos os campos (Instituição, Turma, Nome, Matrícula) são obrigatórios.' });
                }
                const alunoInscrito = yield this.service.criarEInscrever({
                    nomeCompleto: nome,
                    matricula,
                    idInstituicao: Number(idInstituicao),
                    idTurma: Number(idTurma),
                    docenteId
                });
                return res.status(201).json(alunoInscrito);
            }
            catch (error) {
                if (error instanceof Error) {
                    if (error.message.includes("permissão"))
                        return res.status(403).json({ error: error.message });
                    if (error.message.includes("já inscrito"))
                        return res.status(409).json({ error: error.message });
                }
                console.error(error);
                return res.status(500).json({ error: 'Erro ao cadastrar e inscrever aluno.' });
            }
        });
    }
    listarPorDocente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const docenteId = req.docenteId;
                const alunos = yield this.service.listarPorDocente(docenteId);
                return res.json(alunos);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao listar todos os alunos.' });
            }
        });
    }
    uploadCSV(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idInstituicao, idTurma } = req.params;
                const docenteId = req.docenteId;
                if (!idInstituicao || !idTurma) {
                    return res.status(400).json({ error: 'ID da Instituição e da Turma são obrigatórios na URL.' });
                }
                if (!req.file) {
                    return res.status(400).json({ error: 'Nenhum arquivo CSV enviado.' });
                }
                const filePath = req.file.path;
                const resultado = yield this.service.processarCSV({
                    filePath,
                    idInstituicao: Number(idInstituicao),
                    idTurma: Number(idTurma),
                    docenteId
                });
                return res.status(201).json(resultado);
            }
            catch (error) {
                if (error instanceof Error) {
                    if (error.message.includes("permissão"))
                        return res.status(403).json({ error: error.message });
                }
                console.error(error);
                return res.status(500).json({ error: 'Erro ao processar arquivo CSV.' });
            }
        });
    }
    listarPorTurma(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idTurma } = req.params;
                const docenteId = req.docenteId;
                if (idTurma) {
                    const alunos = yield this.service.listarPorTurma(Number(idTurma), docenteId);
                    return res.json(alunos);
                }
                else {
                    const alunos = yield this.service.listarPorDocente(docenteId);
                    return res.json(alunos);
                }
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao listar alunos.' });
            }
        });
    }
    desinscrever(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idInscricao } = req.params;
                const docenteId = req.docenteId;
                yield this.service.desinscrever(Number(idInscricao), docenteId);
                return res.status(204).send();
            }
            catch (error) {
                if (error instanceof Error && error.message.includes("não encontrada")) {
                    return res.status(404).json({ error: error.message });
                }
                console.error(error);
                return res.status(500).json({ error: 'Erro ao desinscrever aluno.' });
            }
        });
    }
    excluirTotalmente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idAluno } = req.params;
                const docenteId = req.docenteId;
                yield this.service.excluirAlunoTotalmente(Number(idAluno), docenteId);
                return res.status(204).send();
            }
            catch (error) {
                if (error instanceof Error && error.message.includes('não encontrado')) {
                    return res.status(404).json({ error: error.message });
                }
                console.error(error);
                return res.status(500).json({ error: 'Erro ao excluir aluno.' });
            }
        });
    }
}
exports.AlunosController = AlunosController;
//# sourceMappingURL=aluno.controller.js.map