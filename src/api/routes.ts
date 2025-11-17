import { Router } from 'express';
import { authRoutes } from './auth/auth.routes';
import { instituicoesRoutes } from './instituicoes/instituicoes.routes';
import { turmasRoutes } from './turmas/turmas.routes';
import { disciplinasRoutes } from './disciplinas/disciplinas.routes';
import alunoRoutes from './aluno/aluno.routes';
import { notasRoutes } from './notas/notas.routes';
import { componentesRoutes } from './comp-nota/componentes.routes';


const unifiedRoutes = Router();


unifiedRoutes.use('/auth', authRoutes);
unifiedRoutes.use('/instituicoes', instituicoesRoutes);
unifiedRoutes.use('/turmas', turmasRoutes);
unifiedRoutes.use('/disciplinas', disciplinasRoutes);
unifiedRoutes.use('/alunos', alunoRoutes);
unifiedRoutes.use('/notas', notasRoutes);
unifiedRoutes.use('/componentes', componentesRoutes)

export { unifiedRoutes };
