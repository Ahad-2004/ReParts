import { Router } from 'express';
import { firestore } from '../config/firebase';
import authMiddleware from '../middlewares/auth';

const router = Router();
const chatsCol = firestore.collection('chats');

// List chats for authenticated user or by listingId
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const listingId = req.query.listingId as string | undefined;
    const uid = req.uid as string;

    if (listingId) {
      // get chats for this listing, then filter to those involving the user
      const snap = await chatsCol.where('listingId', '==', listingId).get();
      const results = [] as any[];
      for (const d of snap.docs) {
        const data = d.data() as any;
        // best-effort: if sellerId missing but sellerEmail present, try to resolve and patch
        if (!data.sellerId && data.sellerEmail) {
          const usersSnap = await firestore.collection('users').where('email', '==', data.sellerEmail).limit(1).get();
          if (!usersSnap.empty) {
            const sellerUid = usersSnap.docs[0].id;
            try {
              await chatsCol.doc(d.id).update({ sellerId: sellerUid });
              data.sellerId = sellerUid;
            } catch (e) {
              // ignore update errors
            }
          }
        }
        const chatObj = { id: d.id, ...data };
        if (chatObj.sellerId === uid || chatObj.buyerId === uid) results.push(chatObj);
      }
      return res.json(results);
    }

    // fetch chats where user is seller
    // fetch chats where user is seller or buyer. Also attempt to repair missing sellerId entries.
    const sellerSnap = await chatsCol.where('sellerId', '==', uid).get();
    const buyerSnap = await chatsCol.where('buyerId', '==', uid).get();

    const map = new Map<string, any>();

    // helper to push docs and attempt to resolve missing fields
    const processDocs = async (docs: FirebaseFirestore.QueryDocumentSnapshot[]) => {
      for (const d of docs) {
        const data = d.data() as any;
        // try to resolve sellerId if missing but sellerEmail exists
        if (!data.sellerId && data.sellerEmail) {
          const usersSnap = await firestore.collection('users').where('email', '==', data.sellerEmail).limit(1).get();
          if (!usersSnap.empty) {
            const sellerUid = usersSnap.docs[0].id;
            try {
              await chatsCol.doc(d.id).update({ sellerId: sellerUid });
              data.sellerId = sellerUid;
            } catch (e) {
              // ignore update errors
            }
          }
        }
        map.set(d.id, { id: d.id, ...data });
      }
    };

    await processDocs(sellerSnap.docs);
    await processDocs(buyerSnap.docs);

    return res.json(Array.from(map.values()));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req: any, res) => {
  let { buyerId, buyerEmail, sellerId, listingId, initialMessage, sellerEmail } = req.body;
  // allow buyer to omit buyerId (trust auth) and allow sellerId to be resolved from sellerEmail
  try {
    if (!buyerId) buyerId = req.uid;

    // If sellerId not provided but sellerEmail is, try to resolve sellerId from users collection
    if (!sellerId && sellerEmail) {
      const usersSnap = await firestore.collection('users').where('email', '==', sellerEmail).limit(1).get();
      if (!usersSnap.empty) {
        sellerId = usersSnap.docs[0].id;
      }
    }

    // Create or find existing chat between buyer and seller for this listing
    let existingChatsQuery: FirebaseFirestore.Query = chatsCol
      .where('buyerId', '==', buyerId)
      .where('listingId', '==', listingId);
    if (sellerId) {
      existingChatsQuery = existingChatsQuery.where('sellerId', '==', sellerId);
    }
    const existingChatsSnap = await existingChatsQuery.limit(1).get();

    let chatId = '';
    if (existingChatsSnap.docs.length > 0) {
      chatId = existingChatsSnap.docs[0].id;
    } else {
    const created = await chatsCol.add({
      buyerId,
      buyerEmail,
      sellerId,
      listingId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    chatId = created.id;
  }

    // Add initial message if provided
    if (initialMessage) {
      await chatsCol.doc(chatId).collection('messages').add({
        senderId: buyerId,
        senderEmail: buyerEmail,
        text: initialMessage,
        createdAt: new Date(),
      });
    }

    // Update chat updatedAt
    await chatsCol.doc(chatId).update({ updatedAt: new Date() });

    res.status(201).json({ id: chatId });
  } catch (err: any) {
    console.error('Error creating chat', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const chatDoc = await chatsCol.doc(req.params.id).get();
    if (!chatDoc.exists) return res.status(404).json({ error: 'Chat not found' });
    const chatData = chatDoc.data() as any;
    const uid = req.uid as string;
    // only allow participants to fetch messages
    if (chatData.buyerId !== uid && chatData.sellerId !== uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const messagesSnap = await chatsCol.doc(req.params.id).collection('messages').orderBy('createdAt', 'asc').get();
    const msgs = messagesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json(msgs);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

  router.post('/:id/messages', authMiddleware, async (req: any, res) => {
    const { text } = req.body;
    const chatId = req.params.id;
    try {
      const chatDoc = await chatsCol.doc(chatId).get();
      if (!chatDoc.exists) return res.status(404).json({ error: 'Chat not found' });
      const userDoc = await firestore.collection('users').doc(req.uid).get();
      const senderEmail = userDoc.data()?.email || 'Unknown';
      const msgRef = await chatsCol.doc(chatId).collection('messages').add({
        senderId: req.uid,
        senderEmail,
        text,
        createdAt: new Date(),
      });
      await chatsCol.doc(chatId).update({ updatedAt: new Date() });
      res.status(201).json({ id: msgRef.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

export default router;
