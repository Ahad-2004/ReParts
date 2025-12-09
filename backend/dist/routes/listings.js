"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebase_1 = require("../config/firebase");
const auth_1 = __importDefault(require("../middlewares/auth"));
const algolia_1 = require("../config/algolia");
const router = (0, express_1.Router)();
const listingsCol = firebase_1.firestore.collection('listings');
const ALGOLIA_INDEX = process.env.ALGOLIA_LISTINGS_INDEX || 'reparts_listings';
const algoliaIndex = algolia_1.algoliaClient.initIndex(ALGOLIA_INDEX);
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const snap = yield listingsCol.limit(50).get();
    const docs = snap.docs.map(d => (Object.assign({ id: d.id }, d.data())));
    res.json(docs);
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield listingsCol.doc(req.params.id).get();
    if (!doc.exists)
        return res.status(404).json({ error: 'Not found' });
    res.json(Object.assign({ id: doc.id }, doc.data()));
}));
router.post('/', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    data.sellerId = req.uid;
    data.createdAt = new Date();
    const created = yield listingsCol.add(data);
    // store objectID in Firestore for Algolia
    yield created.update({ objectID: created.id });
    const docSnap = yield created.get();
    const record = Object.assign({ objectID: created.id }, docSnap.data());
    try {
        yield algoliaIndex.saveObject(record);
    }
    catch (err) {
        console.error('Algolia save error', err);
    }
    res.status(201).json({ id: created.id });
}));
router.put('/:id', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const docRef = listingsCol.doc(id);
    const doc = yield docRef.get();
    if (!doc.exists)
        return res.status(404).json({ error: 'Not found' });
    const existing = doc.data() || {};
    if (existing.sellerId !== req.uid)
        return res.status(403).json({ error: 'Forbidden' });
    yield docRef.update(Object.assign(Object.assign({}, req.body), { updatedAt: new Date() }));
    const updatedSnap = yield docRef.get();
    const record = Object.assign({ objectID: id }, updatedSnap.data());
    try {
        yield algoliaIndex.saveObject(record);
    }
    catch (err) {
        console.error('Algolia update error', err);
    }
    res.json({ id });
}));
router.delete('/:id', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const docRef = listingsCol.doc(id);
    const doc = yield docRef.get();
    if (!doc.exists)
        return res.status(404).json({ error: 'Not found' });
    const existing = doc.data() || {};
    if (existing.sellerId !== req.uid)
        return res.status(403).json({ error: 'Forbidden' });
    yield docRef.delete();
    try {
        yield algoliaIndex.deleteObject(id);
    }
    catch (err) {
        console.error('Algolia delete error', err);
    }
    res.json({ id });
}));
exports.default = router;
