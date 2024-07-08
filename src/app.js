// app.js
import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import swaggerDocs from './swagger.js';
import authenticate from './middlewares/auth.middleware.js';
import propertiesRoutes from './routes/v1/properties.js';
import usersRoutes from './routes/v1/users.routes.js';

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
    res.send('Welcome to the Property Listings API!');
});
app.use('/api/v1/properties', propertiesRoutes);
app.use('/api/v1/users', authenticate, usersRoutes);

app.listen(PORT, () => 
{
    console.log(`Server is running on port ${PORT}`);
});
swaggerDocs(app, PORT);