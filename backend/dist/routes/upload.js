"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const router = (0, express_1.Router)();
router.get('/sign', auth_1.default, (req, res) => {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary_1.default.utils.api_sign_request({ timestamp }, process.env.CLOUDINARY_API_SECRET || '');
    res.json({ timestamp, signature, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
});
exports.default = router;
