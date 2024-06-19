import { Router } from "express";
import usersController from '../../controllers/users.controller.js';
const router = Router();

/** POST Methods */
/**
 * @openapi
 * '/api/v1/users':
 *  post:
 *     tags:
 *     - User Controller
 *     summary: Create a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *            properties:
 *              email:
 *                type: string
 *                default: ''
 *     responses:
 *      201:
 *        description: Created
 *      400:
 *        description: Bad Request
 *      409:
 *        description: Conflict
 *      500:
 *        description: Server Error
 */
router.route('/').post(usersController.createUser);

/** GET Methods */
/**
 * @openapi
 * '/api/v1/users/{id}':
 *  get:
 *     tags:
 *     - User Controller
 *     summary: Get a user by id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The id of the user
 *        required: true
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.route('/:id').get(usersController.getUserById);
/**
 * @openapi
 * '/api/v1/users':
 *  get:
 *     tags:
 *     - User Controller
 *     summary: Get a list of user
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.route('/').get(usersController.getUserList);

/** PUT Methods */
/**
 * @openapi
 * '/api/v1/users/{id}':
 *  put:
 *     tags:
 *     - User Controller
 *     summary: Modify a user by id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique Id of the user
 *        required: true
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - isEnabled
 *            properties:
 *              email:
 *                type: string
 *                default: ''
 *              isEnabled:
 *                type: boolean
 *                default: ''
 *     responses:
 *      200:
 *        description: Modified
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.route('/:id').put(usersController.updateUser);

/** DELETE Methods */
/**
 * @openapi
 * '/api/v1/users/{id}':
 *  delete:
 *     tags:
 *     - User Controller
 *     summary: Delete user by Id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique Id of the user
 *        required: true
 *     responses:
 *      204:
 *        description: Removed
 *      400:
 *        description: Bad request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.route('/:id').delete(usersController.deleteUser);

export default router
