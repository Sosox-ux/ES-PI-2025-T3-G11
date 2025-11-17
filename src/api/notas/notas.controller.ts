// Feito por Sophia :)

import { Request, Response } from 'express';
import { NotasService } from './notas.service';

/**
 * Controller responsável por gerenciar as operações relacionadas às notas.
 * Inclui funcionalidades para listar componentes de nota, listar a grade de notas de uma turma
 * e salvar notas em lote.
 */
export class NotasController {
  private service = new NotasService();

  /**
   * Lista os componentes de nota para uma disciplina específica.
   * @param req Objeto de requisição do Express, contendo o ID da disciplina nos parâmetros.
   * @param res Objeto de resposta do Express.
   */
  async listarComponentes(req: Request, res: Response) {
    try {
      const { idDisciplina } = req.params;
      const docenteId = req.docenteId!;
      const componentes = await this.service.listarComponentesPorDisciplina(Number(idDisciplina), docenteId);
      return res.json(componentes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar componentes de nota.' });
    }
  }

  /**
   * Lista a grade de notas de uma turma específica.
   * Retorna uma estrutura de dados que inclui alunos e suas notas para cada componente.
   * @param req Objeto de requisição do Express, contendo o ID da turma nos parâmetros.
   * @param res Objeto de resposta do Express.
   */
  async listarGrid(req: Request, res: Response) {
    try {
      const { idTurma } = req.params;
      const docenteId = req.docenteId!;
      const grid = await this.service.listarNotasGridPorTurma(Number(idTurma), docenteId);
      return res.json(grid);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao carregar grade de notas.' });
    }
  }

  /**
   * Salva ou atualiza notas em lote.
   * Espera um array de objetos de nota no corpo da requisição.
   * @param req Objeto de requisição do Express, contendo um array de notas no corpo.
   * @param res Objeto de resposta do Express.
   */
  async salvarLote(req: Request, res: Response) {
    try {
      const notas = req.body.notas; 
      const docenteId = req.docenteId!;

      if (!Array.isArray(notas) || notas.length === 0) {
        return res.status(400).json({ error: 'Corpo da requisição deve ser um array de notas.' });
      }
      const resultado = await this.service.lancarOuAtualizarLote(notas, docenteId);
      return res.status(200).json(resultado);
    } catch (error) {
       if (error instanceof Error && error.message.includes("Permissão negada")) {
        return res.status(403).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: 'Erro ao salvar notas.' });
    }
  }

  async exportar(req: Request, res: Response) {
    try {
      const { idTurma } = req.params;
      const docenteId = req.docenteId!;

      const csvData = await this.service.exportarCsv(Number(idTurma), docenteId);

      // Headers obrigatórios para download
      res.header('Content-Type', 'text/csv; charset=utf-8'); // Charset ajuda com acentos
      res.attachment(`notas_turma_${idTurma}.csv`);
      return res.send(csvData);

    } catch (error) {
      console.error(error); 
      return res.status(500).json({ error: 'Erro ao exportar CSV.' });
    }
  }
}
