import { Router } from 'express';

import { authRoutes } from './auth/auth.routes'; 


const unifiedRoutes = Router();


unifiedRoutes.use('/auth', authRoutes);

// (Adicione outras rotas aqui no futuro)
// unifiedRoutes.use('/instituicoes', ...);


export { unifiedRoutes };