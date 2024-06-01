import { Router } from "express";
const router = Router();

/** POST Methods */
/**
 * @openapi
 * '/api/houses':
 *  post:
 *     tags:
 *     - House Controller
 *     summary: Create a house
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
 *                default: house title 
 *              description:
 *                type: string
 *                default: house description
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
    res.json({ message: 'create new house' });
});

/** GET Methods */
/**
 * @openapi
 * '/api/houses/{id}':
 *  get:
 *     tags:
 *     - House Controller
 *     summary: Get a house by id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The id of the house
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
    const houseId = req.params.id;
    res.json({ message: `get house id ${houseId}` });
});
/**
 * @openapi
 * '/api/houses':
 *  get:
 *     tags:
 *     - House Controller
 *     summary: Get a list of house
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
    res.json({ message: 'get list of houses' });
});

/** PUT Methods */
/**
 * @openapi
 * '/api/houses/{id}':
 *  put:
 *     tags:
 *     - House Controller
 *     summary: Modify a house by id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique Id of the house
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
    const houseId = req.params.id;
    res.json({ message: `update house id ${houseId}` });
});

/** DELETE Methods */
/**
 * @openapi
 * '/api/houses/{id}':
 *  delete:
 *     tags:
 *     - House Controller
 *     summary: Delete house by Id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique Id of the house
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
    const houseId = req.params.id;
    res.json({ message: `delete house id ${houseId}` });
});

export default router
