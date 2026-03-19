import type { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const status = (err as HttpError).status || 500;

  // Always log server-side so Railway logs capture the real cause, even in production.
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);
  const payload = {
    success: false,
    error: {
      message: status === 500 ? 'Internal server error' : err.message,
      name: err.name,
    },
  };

  if (process.env.NODE_ENV !== 'production') {
    Object.assign(payload.error, { stack: err.stack });
  }

  res.status(status).json(payload);
}
