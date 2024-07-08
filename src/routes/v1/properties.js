import { Router } from "express";
import authenticate from '../../middlewares/auth.middleware.js';
import propertyController from '../../controllers/property-controller.js';
const router = Router();

/** POST Methods */
/**
 * @openapi
 * '/api/v1/properties':
 *  post:
 *     tags:
 *     - Property Controller
 *     summary: Create a property
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - title
 *              - description
 *              - price
 *            properties:
 *              title:
 *                type: string
 *                default: property title 
 *              description:
 *                type: string
 *                default: property description
 *              price:
 *                type: string
 *                default: 0
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
router.route('/').post(authenticate, propertyController.createProperty);

/** GET Methods */
/**
 * @openapi
 * '/api/v1/properties/{id}':
 *  get:
 *     tags:
 *     - Property Controller
 *     summary: Get a property by id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The id of the property
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
router.route('/:id').get(propertyController.getPropertyById);
/**
 * @openapi
 * '/api/v1/properties':
 *  get:
 *     tags:
 *     - Property Controller
 *     summary: Get a list of property
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
router.route('/').get(propertyController.getPropertyList);

/** PUT Methods */
/**
 * @openapi
 * '/api/v1/properties/{id}':
 *  put:
 *     tags:
 *     - Property Controller
 *     summary: Modify a property by id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique Id of the property
 *        required: true
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                default: ''
 *              description:
 *                type: string
 *                default: ''
 *              price:
 *                type: string
 *                default: 0
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
router.route('/:id').put(authenticate, propertyController.updateProperty);

/** DELETE Methods */
/**
 * @openapi
 * '/api/v1/properties/{id}':
 *  delete:
 *     tags:
 *     - Property Controller
 *     summary: Delete property by Id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique Id of the property
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
router.route('/:id').delete(authenticate, propertyController.deleteProperty);

export default router
