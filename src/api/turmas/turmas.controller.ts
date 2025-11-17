// Feito por Sophia :)

import { Request, Response } from 'express';
import { TurmasService } from './turmas.service';

/**
 * Controller responsável por gerenciar as operações relacionadas às turmas.
 * Inclui funcionalidades para criar, listar, atualizar e deletar turmas.
 */
export class TurmasController {
  private service = new TurmasService();

  /**
   * Cria uma nova turma.
   * Valida os dados de entrada e utiliza o serviço para registrar a turma.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async criar(req: Request, res: Response) {
    try {
      const { nome, codigo, apelido, idInstituicao, idDisciplina } = req.body;
      const docenteId = req.docenteId;
      
      if (!nome || !idInstituicao || !idDisciplina || !docenteId) {
        return res.status(400).json({ error: 'Nome, Instituição e Disciplina são obrigatórios.' });
      }
      
      const turma = await this.service.criar({ 
        nome, 
        codigo, 
        apelido, 
        idInstituicao: Number(idInstituicao),
        idDisciplina: Number(idDisciplina),
        docenteId
      });
      return res.status(201).json(turma);

    } catch (error) {
      if (error instanceof Error && error.message.includes("permissão")) {
        return res.status(403).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar turma.' });
    }
  }

  /**
   * Lista as turmas associadas a uma instituição específica e ao docente autenticado.
   * @param req Objeto de requisição do Express, contendo o ID da instituição nos parâmetros.
   * @param res Objeto de resposta do Express.
   */
  async listarPorInstituicao(req: Request, res: Response) {
    try {
      const { idInstituicao } = req.params;
      const docenteId = req.docenteId!;
      
      const turmas = await this.service.listarPorInstituicao(Number(idInstituicao), docenteId);
      return res.json(turmas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar turmas.' });
    }
  }

  /**
   * Lista todas as turmas associadas ao docente autenticado.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async listarPorDocente(req: Request, res: Response) {
    try {
      const docenteId = req.docenteId!;
      const turmas = await this.service.listarPorDocente(docenteId);
      return res.json(turmas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar turmas.' });
    }
  }

  /**
   * Atualiza os dados de uma turma existente.
   * Garante que apenas o docente proprietário possa atualizar a turma.
   * @param req Objeto de requisição do Express, contendo o ID da turma nos parâmetros e os dados no corpo.
   * @param res Objeto de resposta do Express.
   */
  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, codigo, apelido } = req.body;
      const docenteId = req.docenteId!;

      const turma = await this.service.atualizar({
        id: Number(id),
        nome,
        codigo,
        apelido,
        docenteId
      });
      return res.json(turma);
    } catch (error) {
      if (error instanceof Error && error.message.includes("não encontrada")) {
        return res.status(404).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar turma.' });
    }
  }

  /**
   * Deleta uma turma existente.
   * Garante que apenas o docente proprietário possa deletar a turma e verifica se há alunos inscritos.
   * @param req Objeto de requisição do Express, contendo o ID da turma nos parâmetros.
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
      return res.status(500).json({ error: 'Erro ao deletar turma.' });
    }
  }
}
