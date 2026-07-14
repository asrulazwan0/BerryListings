import { Router } from 'express';
import authController from '../../controllers/auth-controller.js';
const router = Router();

/**
 * @openapi
 * '/api/v1/auth/google':
 *  post:
 *     tags:
 *     - Auth Controller
 *     summary: Log in with a Google ID token
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - idToken
 *            properties:
 *              idToken:
 *                type: string
 *                default: ''
 *     responses:
 *      200:
 *        description: Logged in successfully, returns a bearer JWT
 *      400:
 *        description: Bad Request
 *      401:
 *        description: Invalid Google token
 *      403:
 *        description: Email not registered or not enabled
 *      500:
 *        description: Server Error
 */
router.route('/google').post(authController.googleLogin);

export default router;
