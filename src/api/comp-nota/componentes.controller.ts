// Feito por Sophia :)

import { Request, Response } from 'express';
import { ComponentesService } from './componentes.service';

/**
 * Controller responsável por gerenciar as operações relacionadas aos componentes de nota.
 * Inclui funcionalidades para listar, criar e deletar componentes.
 */
export class ComponentesController {
  private service = new ComponentesService();

  /**
   * Lista todos os componentes de nota para uma disciplina específica.
   * @param req Objeto de requisição do Express, contendo o ID da disciplina nos parâmetros.
   * @param res Objeto de resposta do Express.
   */
  async listar(req: Request, res: Response) {
    try {
      const { idDisciplina } = req.params;
      const componentes = await this.service.listar(Number(idDisciplina));
      return res.json(componentes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar componentes.' });
    }
  }

  /**
   * Cria um novo componente de nota.
   * Valida os campos obrigatórios e utiliza o serviço para criar o componente.
   * @param req Objeto de requisição do Express, contendo os dados do componente no corpo.
   * @param res Objeto de resposta do Express.
   */
  async criar(req: Request, res: Response) {
    try {
      const { nome, sigla, peso, idDisciplina } = req.body;
      
      if (!nome || !sigla || !idDisciplina) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
      }

      await this.service.criar({
        nome,
        sigla,
        // Se o peso não for fornecido, assume o valor padrão de 1 (para cálculo de média aritmética).
        peso: peso ? parseFloat(peso) : 1, 
        idDisciplina: Number(idDisciplina)
      });
      return res.status(201).json({ message: 'Componente criado!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar componente.' });
    }
  }

  /**
   * Deleta um componente de nota existente.
   * @param req Objeto de requisição do Express, contendo o ID do componente nos parâmetros.
   * @param res Objeto de resposta do Express.
   */
  async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.service.deletar(Number(id));
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao deletar.' });
    }
  }
}
