// Feito por Sophia :)

import { Request, Response } from 'express';
import { InstituicoesService } from './instituicoes.service';

/**
 * Controller responsável por gerenciar as operações relacionadas às instituições.
 * Inclui funcionalidades para criar, listar e deletar instituições.
 */
export class InstituicoesController {
  private service = new InstituicoesService();

  /**
   * Cria uma nova instituição.
   * Valida os dados de entrada e utiliza o serviço para registrar a instituição.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async criar(req: Request, res: Response) {
    try {
      const { nome, local } = req.body; 
      const docenteId = req.docenteId;
      
      if (!nome || !docenteId) {
        return res.status(400).json({ error: 'Nome é obrigatório.' });
      }
    
      const instituicao = await this.service.criar({ nome, local, docenteId });
      
      return res.status(201).json(instituicao);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar instituição.' });
    }
  }

  /**
   * Lista todas as instituições associadas ao docente autenticado.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async listar(req: Request, res: Response) {
    try {
      const docenteId = req.docenteId!; 
      
      const instituicoes = await this.service.listar(docenteId);
      return res.json(instituicoes); 

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar instituições.' });
    }
  }

  /**
   * Deleta uma instituição existente.
   * Verifica a permissão do docente antes de realizar a exclusão.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params; 
      const docenteId = req.docenteId!;
      
      await this.service.deletar({ id: Number(id), docenteId });
      return res.status(204).send(); 
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("não encontrada")) {
        return res.status(404).json({ error: error.message });
      }
      // Erro de constraint (ex: ORA-02292) indica que a instituição possui disciplinas associadas.
      return res.status(500).json({ error: 'Erro ao deletar instituição. Verifique se ela possui disciplinas.' });
    }
  }
}
