import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';

export const COOKIE = 'admin_session';
type Req = Request & { adminId?: string | null };
const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error('JWT_SECRET must be set (32+ chars)');
  return s;
};
export const signToken = (id: string) => jwt.sign({ sub: id }, secret(), { expiresIn: '7d' });
function read(req: Request): string | null {
  try {
    const t = req.cookies?.[COOKIE];
    return t ? String((jwt.verify(t, secret()) as jwt.JwtPayload).sub) : null;
  } catch { return null; }
}
export function optionalAuth(req: Request, _res: Response, next: NextFunction) { (req as Req).adminId = read(req); next(); }
export const isAdmin = (req: Request) => Boolean((req as Req).adminId);
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  (req as Req).adminId = read(req);
  if (!isAdmin(req)) return res.status(401).json({ success: false, error: 'Unauthorized' });
  next();
}
export function jsonOnly(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // File uploads use multipart/form-data, so allow them through.
  if (req.is('multipart/form-data')) {
    return next();
  }

  // All other write requests must use JSON.
  if (
    ['POST', 'PUT', 'PATCH'].includes(req.method) &&
    !req.is('application/json')
  ) {
    return res.status(415).json({
      success: false,
      error: 'JSON required',
    });
  }

  next();
}
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError)
    return res.status(400).json({ success: false, error: 'Validation failed', details: err.flatten().fieldErrors });
  const code = (err as { code?: string }).code;
  if (code === 'P2002') return res.status(409).json({ success: false, error: 'Already exists' });
  if (code === 'P2025') return res.status(404).json({ success: false, error: 'Not found' });
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
}
