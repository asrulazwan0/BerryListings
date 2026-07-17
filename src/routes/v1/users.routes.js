import { Router } from 'express';
import authMiddleware from '../../middlewares/auth.middleware.js';
import { requireScope } from '../../middlewares/require-scope.middleware.js';
import usersController from '../../controllers/users.controller.js';

const { createUser, getUserList, getUserById, updateUser, deleteUser } = usersController;
const auth = authMiddleware;

const usersRoutes = Router();
usersRoutes.use(auth);

usersRoutes.post('/', requireScope('users:create'), createUser);
usersRoutes.get('/', requireScope('users:view'), getUserList);
usersRoutes.get('/:id', requireScope('users:view'), getUserById);
usersRoutes.put('/:id', requireScope('users:edit'), updateUser);
usersRoutes.delete('/:id', requireScope('users:delete'), deleteUser);

export default usersRoutes;
