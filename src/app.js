// app.js
import express, { json } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import swaggerDocs from './swagger.js';
import authenticate from './middlewares/auth.middleware.js';
import requireAdmin from './middlewares/require-admin.middleware.js';
import authRoutes from './routes/v1/auth.routes.js';
import propertiesRoutes from './routes/v1/properties.js';
import usersRoutes from './routes/v1/users.routes.js';
import rolesRoutes from './routes/v1/roles.routes.js';

config();
const PORT = process.env.PORT || 3000;
const app = express();

/** Security */
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.disable('x-powered-by');

/** Rate limiting */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.AUTH_RATE_LIMIT_MAX ? Number(process.env.AUTH_RATE_LIMIT_MAX) : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
});

app.use(generalLimiter);

/** Body parsing */
app.use(json({ limit: '1mb' }));

/** api routes */
app.get('/', (req, res) => {
  res.send('Welcome to the Property Listings API!');
});
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/properties', propertiesRoutes);
app.use('/api/v1/users', authenticate, requireAdmin, usersRoutes);
app.use('/api/v1/roles', authenticate, requireAdmin, rolesRoutes);

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  swaggerDocs(app, PORT);
}

export default app;
