import { Router } from 'express';
import { check } from 'express-validator';
import authenticate from '../../middlewares/auth.middleware.js';
import propertyController from '../../controllers/property-controller.js';
const router = Router();

const PROPERTY_TYPES = ['HOUSE', 'CONDO', 'TOWNHOME', 'LAND'];
const PROPERTY_STATUSES = ['DRAFT', 'ACTIVE', 'PENDING', 'SOLD'];

const propertyFieldValidators = [
    check('title').trim().notEmpty(),
    check('description').trim().notEmpty(),
    check('price').isFloat({ gt: 0 }),
    check('type').optional().isIn(PROPERTY_TYPES),
    check('status').optional().isIn(PROPERTY_STATUSES),
    check('addressLine').trim().notEmpty(),
    check('city').trim().notEmpty(),
    check('bedrooms').isInt({ min: 0 }),
    check('bathrooms').isFloat({ min: 0 }),
    check('sqft').isInt({ min: 0 }),
    check('lotSizeAcres').optional({ values: 'null' }).isFloat({ min: 0 }),
    check('yearBuilt').optional({ values: 'null' }).isInt({ min: 1800, max: new Date().getFullYear() + 1 }),
    check('amenities').optional().isArray(),
    check('agentId').not().exists().withMessage('agentId is derived from authentication'),
];

const validateCreateProperty = propertyFieldValidators;
const validateUpdateProperty = propertyFieldValidators;

/** POST Methods */
/**
 * @openapi
 * '/api/v1/properties':
 *  post:
 *     tags:
 *     - Property Controller
 *     summary: Create a property
 *     security:
 *      - bearerAuth: []
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
 *              - addressLine
 *              - city
 *              - bedrooms
 *              - bathrooms
 *              - sqft
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
 *              type:
 *                type: string
 *                enum: [HOUSE, CONDO, TOWNHOME, LAND]
 *                default: HOUSE
 *              status:
 *                type: string
 *                enum: [DRAFT, ACTIVE, PENDING, SOLD]
 *                default: DRAFT
 *              addressLine:
 *                type: string
 *                default: 214 Maple Ridge Rd
 *              city:
 *                type: string
 *                default: Ashbourne
 *              bedrooms:
 *                type: integer
 *                default: 0
 *              bathrooms:
 *                type: number
 *                default: 0
 *              sqft:
 *                type: integer
 *                default: 0
 *              lotSizeAcres:
 *                type: number
 *                nullable: true
 *              yearBuilt:
 *                type: integer
 *                nullable: true
 *              amenities:
 *                type: array
 *                items:
 *                  type: string
 *     responses:
 *      201:
 *        description: Created
 *      400:
 *        description: Bad Request
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Forbidden
 *      409:
 *        description: Conflict
 *      500:
 *        description: Server Error
 */
router.route('/').post(authenticate, validateCreateProperty, propertyController.createProperty);

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
 *     security:
 *      - bearerAuth: []
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
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Forbidden
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
 *     security:
 *      - bearerAuth: []
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
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Forbidden
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.route('/:id').delete(authenticate, propertyController.deleteProperty);

export default router;
