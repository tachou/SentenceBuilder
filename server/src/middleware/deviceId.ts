import type { Request, Response, NextFunction } from 'express';
import { validate as uuidValidate } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      deviceId: string;
    }
  }
}

export function deviceIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const deviceId = req.headers['x-device-id'] as string | undefined;

  if (!deviceId || !uuidValidate(deviceId)) {
    res.status(400).json({ error: 'Missing or invalid X-Device-Id header' });
    return;
  }

  req.deviceId = deviceId;
  next();
}
