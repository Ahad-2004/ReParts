"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.firestore = exports.auth = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!firebase_admin_1.default.apps.length) {
    try {
        const privateKey = (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n');
        // firebase-admin expects the service account keys with these exact property names
        const serviceAccount = {
            project_id: process.env.FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: privateKey,
        };
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
        });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to initialize Firebase Admin:', err);
        throw err;
    }
}
exports.auth = firebase_admin_1.default.auth();
exports.firestore = firebase_admin_1.default.firestore();
