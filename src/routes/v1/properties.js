import { Router } from 'express';
import { body } from 'express-validator';
import authenticate from '../../middlewares/auth.middleware.js';
import propertyController from '../../controllers/property-controller.js';
const router = Router();

const PROPERTY_TYPES = ['HOUSE', 'CONDO', 'TOWNHOME', 'LAND'];
const PROPERTY_STATUSES = ['DRAFT', 'ACTIVE', 'PENDING', 'SOLD'];

const propertyFieldValidators = () => [
    body('title').isString().trim().notEmpty(),
    body('description').isString().trim().notEmpty(),
    body('price').isFloat({ gt: 0 }),
    body('type').optional().isIn(PROPERTY_TYPES),
    body('status').optional().isIn(PROPERTY_STATUSES),
    body('addressLine').isString().trim().notEmpty(),
    body('city').isString().trim().notEmpty(),
    body('bedrooms').isInt({ min: 0 }),
    body('bathrooms').isFloat({ min: 0 }),
    body('sqft').isInt({ min: 0 }),
    body('lotSizeAcres').optional({ values: 'falsy' }).isFloat({ min: 0 }),
    body('yearBuilt')
        .optional({ values: 'falsy' })
        .isInt({ min: 1800, max: new Date().getFullYear() + 1 }),
    body('amenities').optional().isArray({ max: 50 }),
    body('amenities.*').optional().isString().trim().notEmpty(),
    body('photos').optional().isArray({ max: 20 }),
    body('photos.*')
        .optional()
        .isURL({ protocols: ['http', 'https'], require_protocol: true }),
    body('agentId').not().exists().withMessage('agentId is derived from authentication'),
];

const validateCreateProperty = propertyFieldValidators();
const validateUpdateProperty = propertyFieldValidators();

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
 *                example: Modern family home
 *              description:
 *                type: string
 *                example: Spacious home close to the city centre
 *              price:
 *                type: number
 *                format: float
 *                example: 650000
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
 *                example: 214 Maple Ridge Rd
 *              city:
 *                type: string
 *                example: Ashbourne
 *              bedrooms:
 *                type: integer
 *                minimum: 0
 *                example: 4
 *              bathrooms:
 *                type: number
 *                format: float
 *                minimum: 0
 *                example: 2.5
 *              sqft:
 *                type: integer
 *                minimum: 0
 *                example: 2200
 *              lotSizeAcres:
 *                type: number
 *                format: float
 *                minimum: 0
 *                nullable: true
 *              yearBuilt:
 *                type: integer
 *                minimum: 1800
 *                nullable: true
 *              amenities:
 *                type: array
 *                items:
 *                  type: string
 *              photos:
 *                type: array
 *                maxItems: 20
 *                items:
 *                  type: string
 *                  format: uri
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
 *                example: Modern family home
 *              description:
 *                type: string
 *                example: Spacious home close to the city centre
 *              price:
 *                type: number
 *                format: float
 *                example: 650000
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
 *                example: 214 Maple Ridge Rd
 *              city:
 *                type: string
 *                example: Ashbourne
 *              bedrooms:
 *                type: integer
 *                minimum: 0
 *                example: 4
 *              bathrooms:
 *                type: number
 *                format: float
 *                minimum: 0
 *                example: 2.5
 *              sqft:
 *                type: integer
 *                minimum: 0
 *                example: 2200
 *              lotSizeAcres:
 *                type: number
 *                format: float
 *                minimum: 0
 *                nullable: true
 *              yearBuilt:
 *                type: integer
 *                minimum: 1800
 *                nullable: true
 *              amenities:
 *                type: array
 *                maxItems: 50
 *                items:
 *                  type: string
 *              photos:
 *                type: array
 *                maxItems: 20
 *                items:
 *                  type: string
 *                  format: uri
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
router.route('/:id').put(authenticate, validateUpdateProperty, propertyController.updateProperty);

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
