// Feito por Sophia :)

import { Request, Response } from 'express';
import { AlunosService } from './aluno.service';

/**
 * Controller responsável por operações relacionadas a alunos.
 * Inclui funcionalidades de criação/inscrição, listagem por docente/turma,
 * upload de CSV, desinscrição e exclusão total de alunos.
 */
export class AlunosController {
  private service = new AlunosService();

  /**
   * Cria um novo aluno e o inscreve em uma turma.
   * Valida os dados de entrada e utiliza o serviço para realizar a operação.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async criarEInscrever(req: Request, res: Response) {
    try {
      const { nome, matricula, idInstituicao, idTurma } = req.body; 
      const docenteId = req.docenteId!;
      
      if (!nome || !matricula || !idInstituicao || !idTurma) {
        return res.status(400).json({ error: 'Todos os campos (Instituição, Turma, Nome, Matrícula) são obrigatórios.' });
      }
      
      const alunoInscrito = await this.service.criarEInscrever({ 
        nomeCompleto: nome, 
        matricula, 
        idInstituicao: Number(idInstituicao), 
        idTurma: Number(idTurma), 
        docenteId
      });
      return res.status(201).json(alunoInscrito);

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("permissão")) return res.status(403).json({ error: error.message });
        if (error.message.includes("já inscrito")) return res.status(409).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: 'Erro ao cadastrar e inscrever aluno.' });
    }
  }

  /**
   * Lista todos os alunos associados ao docente autenticado.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async listarPorDocente(req: Request, res: Response) {
    try {
      const docenteId = req.docenteId!;
      const alunos = await this.service.listarPorDocente(docenteId);
      return res.json(alunos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar todos os alunos.' });
    }
  }

  /**
   * Processa um arquivo CSV para criar ou inscrever múltiplos alunos.
   * @param req Objeto de requisição do Express (espera um arquivo CSV).
   * @param res Objeto de resposta do Express.
   */
  async uploadCSV(req: Request, res: Response) { 
    try {
      const { idInstituicao, idTurma } = req.params;
      const docenteId = req.docenteId!;
      
      if (!idInstituicao || !idTurma) {
        return res.status(400).json({ error: 'ID da Instituição e da Turma são obrigatórios na URL.' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo CSV enviado.' });
      }
      const filePath = req.file.path;

      const resultado = await this.service.processarCSV({
        filePath,
        idInstituicao: Number(idInstituicao),
        idTurma: Number(idTurma),
        docenteId
      });

      return res.status(201).json(resultado);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("permissão")) return res.status(403).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: 'Erro ao processar arquivo CSV.' });
    }
  }

  /**
   * Lista alunos de uma turma específica ou, se não informada, de todo o docente.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async listarPorTurma(req: Request, res: Response) {
    try {
      const { idTurma } = req.params;
      const docenteId = req.docenteId!;

      if (idTurma) {
        const alunos = await this.service.listarPorTurma(Number(idTurma), docenteId);
        return res.json(alunos);
      } else {
        const alunos = await this.service.listarPorDocente(docenteId);
        return res.json(alunos);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar alunos.' });
    }
  }

  /**
   * Remove a inscrição (matrícula) de um aluno em uma turma específica.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async desinscrever(req: Request, res: Response) {
    try {
      const { idInscricao } = req.params;
      const docenteId = req.docenteId!;
      await this.service.desinscrever(Number(idInscricao), docenteId);
      return res.status(204).send();
    } catch (error) {
       if (error instanceof Error && error.message.includes("não encontrada")) {
        return res.status(404).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: 'Erro ao desinscrever aluno.' });
    }
  }

  /**
   * Apaga o registro do aluno completamente do sistema.
   * Esta é uma operação destrutiva e deve ser usada com cautela.
   * @param req Objeto de requisição do Express.
   * @param res Objeto de resposta do Express.
   */
  async excluirTotalmente(req: Request, res: Response) {
    try {
      const { idAluno } = req.params;
      const docenteId = req.docenteId!;
      await this.service.excluirAlunoTotalmente(Number(idAluno), docenteId);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('não encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: 'Erro ao excluir aluno.' });
    }
  }
}
