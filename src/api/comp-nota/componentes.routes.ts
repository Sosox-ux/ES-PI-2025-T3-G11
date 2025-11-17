// Feito por Sophia :)

import { Router } from 'express';
import { ComponentesController } from './componentes.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';

/**
 * Router para as rotas relacionadas aos componentes de nota.
 * Gerencia a listagem, criação e exclusão de componentes.
 */
const componentesRoutes = Router();
const controller = new ComponentesController();

// Aplica o middleware de autenticação a todas as rotas de componentes.
componentesRoutes.use(authMiddleware);

/**
 * Rota para listar todos os componentes de nota de uma disciplina específica.
 * Requer o ID da disciplina nos parâmetros da URL.
 */
componentesRoutes.get('/disciplina/:idDisciplina', (req, res) => controller.listar(req, res));

/**
 * Rota para criar um novo componente de nota.
 * Espera os dados do componente (nome, sigla, peso, idDisciplina) no corpo da requisição.
 */
componentesRoutes.post('/', (req, res) => controller.criar(req, res));

/**
 * Rota para deletar um componente de nota pelo seu ID.
 * Requer o ID do componente nos parâmetros da URL.
 */
componentesRoutes.delete('/:id', (req, res) => controller.deletar(req, res));

export { componentesRoutes };
