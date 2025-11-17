// Feito por Sophia :)

import { Router } from 'express';
import { AlunosController } from './aluno.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { uploadCsv } from '../../core/middleware/upload';

/**
 * Router para as rotas relacionadas a alunos.
 * Gerencia a criação, listagem, upload de CSV, desinscrição e exclusão de alunos.
 */
const alunoRoutes = Router();
const controller = new AlunosController();

// Aplica o middleware de autenticação a todas as rotas de aluno.
alunoRoutes.use(authMiddleware); 

// Rota para criar e inscrever um novo aluno.
alunoRoutes.post('/', (req, res) => controller.criarEInscrever(req, res));

// Rota para listar todos os alunos associados ao docente autenticado.
alunoRoutes.get('/', (req, res) => controller.listarPorDocente(req, res));

// Rotas para listar alunos por turma (com ou sem ID de turma especificado).
alunoRoutes.get('/turma/:idTurma', (req, res) => controller.listarPorTurma(req, res));
alunoRoutes.get('/turma', (req, res) => controller.listarPorTurma(req, res));

// Rota para desinscrever um aluno de uma turma.
alunoRoutes.delete('/inscricao/:idInscricao', (req, res) => controller.desinscrever(req, res));

// Rota para excluir completamente um aluno.
alunoRoutes.delete('/:idAluno', (req, res) => controller.excluirTotalmente(req, res));

// Rota para upload de arquivo CSV para criação/inscrição de múltiplos alunos.
alunoRoutes.post(
    '/upload-csv/instituicao/:idInstituicao/turma/:idTurma', 
    uploadCsv.single('arquivoCsv'), 
    (req, res) => controller.uploadCSV(req, res)
);

export default alunoRoutes;
