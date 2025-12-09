import { Router } from 'express';
import cloudinary from '../config/cloudinary';
import authMiddleware from '../middlewares/auth';

const router = Router();

router.get('/sign', authMiddleware, (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ timestamp }, process.env.CLOUDINARY_API_SECRET || '');
  res.json({ timestamp, signature, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
});

export default router;
