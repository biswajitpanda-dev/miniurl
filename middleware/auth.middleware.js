import { validateUserToken } from '../utils/token.js';

export function authenticationMiddleware(req, res, next) {
  const authHeader = req.get('authorization');

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (!scheme || scheme.toLowerCase() !== 'bearer') {
    return res.status(400).json({ error: 'Authorization must be Bearer token' });
  }

  try {
    const payload = validateUserToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
