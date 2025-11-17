// Feito por Sophia :)

import { Router } from 'express';
import { DisciplinasController } from './disciplinas.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';

/**
 * Router para as rotas relacionadas às disciplinas.
 * Gerencia a criação, listagem e exclusão de disciplinas.
 */
const disciplinasRoutes = Router();
const controller = new DisciplinasController();

// Aplica o middleware de autenticação a todas as rotas de disciplinas.
disciplinasRoutes.use(authMiddleware); 

/**
 * Rota para criar uma nova disciplina.
 * Espera os dados da disciplina (nome, sigla, código, período_curso) no corpo da requisição.
 */
disciplinasRoutes.post('/', (req, res) => controller.criar(req, res));

/**
 * Rota para listar todas as disciplinas associadas ao docente autenticado.
 */
disciplinasRoutes.get('/', (req, res) => controller.listar(req, res));

/**
 * Rota para deletar uma disciplina pelo seu ID.
 * Requer o ID da disciplina nos parâmetros da URL.
 */
disciplinasRoutes.delete('/:id', (req, res) => controller.deletar(req, res));

export { disciplinasRoutes };
