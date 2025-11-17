// Feito por Sophia :)

import { Router } from 'express';
import { NotasController } from './notas.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';

/**
 * Router para as rotas relacionadas às notas.
 * Gerencia a listagem de componentes de nota, a grade de notas por turma e o salvamento de notas em lote.
 */
const notasRoutes = Router();
const controller = new NotasController();

// Aplica o middleware de autenticação a todas as rotas de notas.
notasRoutes.use(authMiddleware);

/**
 * Rota para buscar os componentes de nota (cabeçalhos da tabela de notas) de uma disciplina.
 * Requer o ID da disciplina nos parâmetros da URL.
 */
notasRoutes.get('/componentes/disciplina/:idDisciplina', (req, res) => controller.listarComponentes(req, res));

/**
 * Rota para buscar os dados da grade de notas de uma turma (alunos e suas respectivas notas).
 * Requer o ID da turma nos parâmetros da URL.
 */
notasRoutes.get('/turma/:idTurma', (req, res) => controller.listarGrid(req, res));

/**
 * Rota para salvar ou atualizar um lote de notas.
 * Espera um array de objetos de nota no corpo da requisição.
 */
notasRoutes.post('/lote', (req, res) => controller.salvarLote(req, res));

/**
 * Rota para exportar as notas de uma turma em formato CSV.
 * Requer o ID da turma nos parâmetros da URL.
 */
notasRoutes.get('/exportar/turma/:idTurma', (req, res) => controller.exportar(req, res));

export { notasRoutes };
