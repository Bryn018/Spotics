import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth';
import apiRoutes from './routes/api';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Logging
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// Start server
const port = env.port;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
