import { Router } from 'express';
import authMiddleware from '../../middlewares/auth.middleware.js';
import rolesController from '../controllers/roles.controller.js';

const roleRoutes = Router();

roleRoutes.use(authMiddleware);

roleRoutes.get('/', rolesController.getRoles);
roleRoutes.put('/:name', rolesController.saveRole);
roleRoutes.delete('/:name', rolesController.deleteRole);

export default roleRoutes;
