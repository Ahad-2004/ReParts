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
const router = (0, express_1.Router)();
const chatsCol = firebase_1.firestore.collection('chats');
router.post('/', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { participants = [], listingId } = req.body;
    const created = yield chatsCol.add({ participants, listingId, updatedAt: new Date() });
    res.status(201).json({ id: created.id });
}));
router.get('/:id/messages', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messagesSnap = yield chatsCol.doc(req.params.id).collection('messages').orderBy('createdAt', 'asc').get();
    const msgs = messagesSnap.docs.map(d => (Object.assign({ id: d.id }, d.data())));
    res.json(msgs);
}));
exports.default = router;
