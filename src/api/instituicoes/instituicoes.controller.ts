import { Request, Response } from 'express';
import { InstituicoesService } from './instituicoes.service';

export class InstituicoesController {
  private service = new InstituicoesService();

  async criar(req: Request, res: Response) {
    try {
      const { nome } = req.body;
      // o 'docenteId' não vem do formulário, ele é injetado pelo middleware
      const docenteId = req.docenteId; 
      
      if (!nome) {
        return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });
      }
      if (!docenteId) {
        // Isso só aconteceria se o middleware falhasse (o que não deve)
        return res.status(401).json({ error: 'Docente não autenticado.' });
      }
      
      const instituicao = await this.service.criar({ nome, docenteId });
      return res.status(201).json(instituicao);

    } catch (error) {
      console.error(error); // Loga o erro no console do servidor
      return res.status(500).json({ error: 'Erro ao criar instituição.' });
    }
  }

  /**
   * READ (Listar)
   */
  async listar(req: Request, res: Response) {
    try {
      const docenteId = req.docenteId!; // O '!' diz ao TS "confie, o middleware garantiu"
      
      const instituicoes = await this.service.listar(docenteId);
      return res.json(instituicoes); // Retorna a lista

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar instituições.' });
    }
  }

  /**
   * UPDATE (Atualizar)
   */
  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params; // Pega o ID da URL
      const { nome } = req.body; // Pega o novo nome do corpo
      const docenteId = req.docenteId!;
      
      if (!nome) {
        return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });
      }
      
      const instituicao = await this.service.atualizar({ id: Number(id), nome, docenteId });
      return res.json(instituicao);
    } catch (error) {
      console.error(error);
      // Trata o erro de "não encontrado" que o service pode jogar
      if (error instanceof Error && error.message.includes("não encontrada")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro ao atualizar instituição.' });
    }
  }
  
  /**
   * DELETE (Deletar)
   */
  async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params; // Pega o ID da URL
      const docenteId = req.docenteId!;
      
      await this.service.deletar({ id: Number(id), docenteId });
      // 204 = "No Content" (Sucesso, mas não retorna nada no corpo)
      return res.status(204).send(); 
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("não encontrada")) {
        return res.status(404).json({ error: error.message });
      }
      // Se o erro for de constraint (ex: ORA-02292), o Oracle vai proibir
      // deletar uma instituição que tem disciplinas. Isso é o correto!
      return res.status(500).json({ error: 'Erro ao deletar instituição. Verifique se ela possui disciplinas.' });
    }
  }
}