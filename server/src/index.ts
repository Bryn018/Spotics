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

console.log('[env] nodeEnv=%s appUrl=%s clientUrl=%s apiUrl=%s', env.nodeEnv, env.appUrl, env.clientUrl, env.apiUrl);
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));
app.use(
  cors({
    origin: [env.clientUrl, env.appUrl].filter(Boolean),
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.cookieSecret));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get(['/health', '/api/health'], (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/auth', authRoutes);
app.use('/api/v1', apiRoutes);

if (env.nodeEnv === 'production') {
  const clientDistPath = path.resolve(__dirname, '../public');

  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));

    app.use((req, res, next) => {
      if (
        req.method !== 'GET' ||
        req.path.startsWith('/api') ||
        req.path.startsWith('/auth') ||
        req.path.startsWith('/health')
      ) {
        return next();
      }

      return res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }
}

app.use(errorHandler);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Spotics API listening on ${env.port}`);
});
