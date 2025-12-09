import { Router } from 'express';
import { firestore } from '../config/firebase';
import authMiddleware from '../middlewares/auth';

const router = Router();
const usersCol = firestore.collection('users');

async function isAdmin(uid: string) {
  const doc = await usersCol.doc(uid).get();
  const data = doc.data();
  return data?.role === 'admin';
}

router.post('/ban-user/:uid', authMiddleware, async (req: any, res) => {
  if (!(await isAdmin(req.uid))) return res.status(403).json({ error: 'Admin only' });
  await usersCol.doc(req.params.uid).update({ banned: true });
  res.json({ ok: true });
});

export default router;
