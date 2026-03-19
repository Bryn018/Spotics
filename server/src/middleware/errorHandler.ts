import type { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  const status = (err as HttpError).status || 500;
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
