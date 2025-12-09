import { Router } from 'express';
import { firestore } from '../config/firebase';
import authMiddleware from '../middlewares/auth';
import { algoliaClient } from '../config/algolia';

const router = Router();
const listingsCol = firestore.collection('listings');
const ALGOLIA_INDEX = process.env.ALGOLIA_LISTINGS_INDEX || 'reparts_listings';
const algoliaIndex = algoliaClient.initIndex(ALGOLIA_INDEX);

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const skip = (page - 1) * limit;

  try {
    const sellerId = req.query.sellerId as string | undefined;
    // Use a simpler, index-free approach: fetch matching docs, sort in memory, then paginate.
    let snap;
    if (sellerId) {
      snap = await listingsCol.where('sellerId', '==', sellerId).get();
    } else {
      snap = await listingsCol.get();
    }
    const docs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    // sort by createdAt (newest first). If createdAt is missing, treat as 0.
    docs.sort((a: any, b: any) => {
      const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return tb - ta;
    });
    const paged = docs.slice(skip, skip + limit);
    res.json({ data: paged });
  } catch (err: any) {
    // log error for debugging
    // eslint-disable-next-line no-console
    console.error('Error in GET /api/listings', err);
    res.status(500).json({ error: err?.message || String(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await listingsCol.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    
    const listingData = doc.data();
    const sellerId = listingData?.sellerId;
    
    // Fetch seller email
    let sellerEmail = '';
    if (sellerId) {
      const userDoc = await firestore.collection('users').doc(sellerId).get();
      sellerEmail = userDoc.data()?.email || '';
    }
    
    res.json({ id: doc.id, ...listingData, sellerEmail });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req: any, res) => {
  const data = req.body;
  data.sellerId = req.uid;
  data.createdAt = new Date();
  const created = await listingsCol.add(data);
  // store objectID in Firestore for Algolia
  await created.update({ objectID: created.id });
  const docSnap = await created.get();
  const record = { objectID: created.id, ...(docSnap.data() as any) };
  try {
    await algoliaIndex.saveObject(record);
  } catch (err) {
    console.error('Algolia save error', err);
  }
  res.status(201).json({ id: created.id });
});

router.put('/:id', authMiddleware, async (req: any, res) => {
  const id = req.params.id;
  const docRef = listingsCol.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: 'Not found' });
  const existing = doc.data() || {};
  if (existing.sellerId !== req.uid) return res.status(403).json({ error: 'Forbidden' });
  await docRef.update({ ...req.body, updatedAt: new Date() });
  const updatedSnap = await docRef.get();
  const record = { objectID: id, ...(updatedSnap.data() as any) };
  try {
    await algoliaIndex.saveObject(record);
  } catch (err) {
    console.error('Algolia update error', err);
  }
  res.json({ id });
});

router.delete('/:id', authMiddleware, async (req: any, res) => {
  const id = req.params.id;
  const docRef = listingsCol.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: 'Not found' });
  const existing = doc.data() || {};
  if (existing.sellerId !== req.uid) return res.status(403).json({ error: 'Forbidden' });
  await docRef.delete();
  try {
    await algoliaIndex.deleteObject(id);
  } catch (err) {
    console.error('Algolia delete error', err);
  }
  res.json({ id });
});

export default router;
