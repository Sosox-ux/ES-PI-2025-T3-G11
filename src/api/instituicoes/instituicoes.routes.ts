// Feito por Sophia :)

import { Router } from 'express';
import { InstituicoesController } from './instituicoes.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';

/**
 * Router para as rotas relacionadas às instituições.
 * Gerencia a criação, listagem e exclusão de instituições.
 */
const instituicoesRoutes = Router();
const controller = new InstituicoesController();

// Aplica o middleware de autenticação a todas as rotas de instituições.
// Isso garante que apenas usuários autenticados possam acessar essas funcionalidades.
instituicoesRoutes.use(authMiddleware); 

// --- DEFINIÇÃO DO CRUD ---

/**
 * Rota para criar uma nova instituição.
 * URL: POST /api/v1/instituicoes/
 * Espera os dados da instituição (nome, local) no corpo da requisição.
 */
instituicoesRoutes.post('/', (req, res) => controller.criar(req, res));

/**
 * Rota para listar todas as instituições associadas ao docente autenticado.
 * URL: GET /api/v1/instituicoes/
 */
instituicoesRoutes.get('/', (req, res) => controller.listar(req, res));

/**
 * Rota para deletar uma instituição pelo seu ID.
 * URL: DELETE /api/v1/instituicoes/:id
 * Requer o ID da instituição nos parâmetros da URL.
 */
instituicoesRoutes.delete('/:id', (req, res) => controller.deletar(req, res));

export { instituicoesRoutes };
