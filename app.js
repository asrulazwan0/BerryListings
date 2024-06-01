// app.js
import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';

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

app.listen(PORT, () => 
{
    console.log(`Server is running on port ${PORT}`);
});