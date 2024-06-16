import { Router } from "express";
const router = Router();

/** POST Methods */
/**
 * @openapi
 * '/api/properties':
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
 *                default: 100,000
 *     responses:
 *      201:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.route('/').post((req, res) => 
{
    res.json({ message: 'create new property' });
});

/** GET Methods */
/**
 * @openapi
 * '/api/properties/{id}':
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
router.route('/:id').get((req, res) => 
{
    const propertyId = req.params.id;
    res.json({ message: `get property id ${propertyId}` });
});
/**
 * @openapi
 * '/api/properties':
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
router.route('/').get((req, res) => 
{
    res.json({ message: 'get list of properties' });
});

/** PUT Methods */
/**
 * @openapi
 * '/api/properties/{id}':
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
router.route('/:id').put((req, res) => 
{
    const propertyId = req.params.id;
    res.json({ message: `update property id ${propertyId}` });
});

/** DELETE Methods */
/**
 * @openapi
 * '/api/properties/{id}':
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
 *      200:
 *        description: Removed
 *      400:
 *        description: Bad request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.route('/:id').delete((req, res) => 
{
    const propertyId = req.params.id;
    res.json({ message: `delete property id ${propertyId}` });
});

export default router
