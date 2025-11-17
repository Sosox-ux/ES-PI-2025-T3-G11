// Feito por Sophia :)

import { Router } from 'express';
import { TurmasController } from './turmas.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';

/**
 * Router para as rotas relacionadas às turmas.
 * Gerencia a criação, listagem, atualização e exclusão de turmas.
 */
const turmasRoutes = Router();
const controller = new TurmasController();

// Aplica o middleware de autenticação a todas as rotas de turmas.
turmasRoutes.use(authMiddleware); 

/**
 * Rota para criar uma nova turma.
 * Espera os dados da turma (nome, codigo, apelido, idInstituicao, idDisciplina) no corpo da requisição.
 */
turmasRoutes.post('/', (req, res) => controller.criar(req, res));

/**
 * Rota para listar todas as turmas associadas ao docente autenticado.
 */
turmasRoutes.get('/', (req, res) => controller.listarPorDocente(req, res));

/**
 * Rota para listar as turmas de uma instituição específica, associadas ao docente autenticado.
 * Requer o ID da instituição nos parâmetros da URL.
 */
turmasRoutes.get('/instituicao/:idInstituicao', (req, res) => controller.listarPorInstituicao(req, res));

/**
 * Rota para atualizar os dados de uma turma existente.
 * Requer o ID da turma nos parâmetros da URL e os dados atualizados no corpo da requisição.
 */
turmasRoutes.put('/:id', (req, res) => controller.atualizar(req, res));

/**
 * Rota para deletar uma turma pelo seu ID.
 * Requer o ID da turma nos parâmetros da URL.
 */
turmasRoutes.delete('/:id', (req, res) => controller.deletar(req, res));

export { turmasRoutes };
