// Feito por Sophia :)

import { Request, Response } from 'express';
import { DisciplinasService } from './disciplinas.service';

/**
 * Controller responsável por gerenciar as operações relacionadas às disciplinas.
 * Inclui funcionalidades para criar, listar e deletar disciplinas.
 */
export class DisciplinasController {
  private service = new DisciplinasService();

  /**
   * Cria uma nova disciplina.
   * Valida os dados de entrada e utiliza o serviço para registrar a disciplina.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async criar(req: Request, res: Response) {
    try {
      const { nome, sigla, codigo, periodo_curso } = req.body;
      const docenteId = req.docenteId; 
      
      if (!nome || !docenteId) {
        return res.status(400).json({ error: 'Nome é obrigatório.' });
      }
      
      const disciplina = await this.service.criar({ 
        nome, 
        sigla, 
        codigo, 
        periodo_curso, 
        docenteId
      });
      return res.status(201).json(disciplina);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar disciplina.' });
    }
  }

  /**
   * Lista todas as disciplinas associadas ao docente autenticado.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async listar(req: Request, res: Response) {
    try {
      const docenteId = req.docenteId!;
      
      const disciplinas = await this.service.listar(docenteId);
      return res.json(disciplinas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar disciplinas.' });
    }
  }

  /**
   * Deleta uma disciplina existente.
   * Verifica a permissão do docente antes de realizar a exclusão.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const docenteId = req.docenteId!;
      
      await this.service.deletar(Number(id), docenteId);
      return res.status(204).send(); 
    } catch (error) {
      if (error instanceof Error && error.message.includes("não encontrada")) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof Error && error.message.includes("Não é possível deletar")) {
        return res.status(409).json({ error: error.message }); 
      }
      console.error(error);
      return res.status(500).json({ error: 'Erro ao deletar disciplina.' });
    }
  }
}
