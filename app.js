// app.js
import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import swaggerDocs from './swagger.js';
import propertiesRoutes from './src/routes/v1/properties.js';

config()
const PORT = process.env.PORT || 3000;
const app = express();

/** middlewares */
app.use(json());
app.use(cors());
app.disable('x-powered-by'); 

/** api routes */
app.get('/', (req, res) => 
{
    res.send('Welcome to the House Listings API!');
});
app.use('/api/v1/properties', propertiesRoutes);

app.listen(PORT, () => 
{
    console.log(`Server is running on port ${PORT}`);
});
swaggerDocs(app, PORT);