import { Router } from 'express';
import authController from '../../controllers/auth-controller.js';
const router = Router();

router.route('/google').post(authController.googleLogin);
router.route('/dev-login').post(authController.devLogin);

export default router;
