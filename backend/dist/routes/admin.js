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
const usersCol = firebase_1.firestore.collection('users');
function isAdmin(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const doc = yield usersCol.doc(uid).get();
        const data = doc.data();
        return (data === null || data === void 0 ? void 0 : data.role) === 'admin';
    });
}
router.post('/ban-user/:uid', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield isAdmin(req.uid)))
        return res.status(403).json({ error: 'Admin only' });
    yield usersCol.doc(req.params.uid).update({ banned: true });
    res.json({ ok: true });
}));
exports.default = router;
