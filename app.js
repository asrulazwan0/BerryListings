// app.js
const express = require('express');
const app = express();

require('./swagger')(app);

// Define routes and middleware here
app.get('/', (req, res) => 
{
    res.send('Welcome to the House Listings API!');
});

/**
 * @swagger
 * /api/houses:
 *   get:
 *     summary: Get a list of houses
 *     responses:
 *       200:
 *         description: Successful response
 */
app.get('/api/houses', (req, res) => 
{
    res.json({ message: 'List of houses' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => 
{
    console.log(`Server is running on port ${PORT}`);
});
