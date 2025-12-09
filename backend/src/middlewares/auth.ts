import { Request, Response, NextFunction } from 'express';
import { auth as firebaseAuth } from '../config/firebase';

export interface AuthedRequest extends Request {
  uid?: string;
  token?: any;
}

export default async function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await firebaseAuth.verifyIdToken(idToken);
    req.uid = decoded.uid;
    req.token = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid ID token' });
  }
}
