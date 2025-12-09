# ReParts Marketplace - Deployment Guide

This guide walks you through deploying the ReParts marketplace on **Render** (backend) and **Vercel** (frontend).

## Prerequisites

Before deploying, ensure you have:
- A [Render](https://render.com) account (free tier available)
- A [Vercel](https://vercel.com) account (free tier available)
- A Firebase project with Admin SDK credentials
- An Algolia account (free tier available)
- A Cloudinary account (optional, for image uploads)
- GitHub account with this repository pushed to it

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Repository

1. Push your code to GitHub if not already done:
```bash
git add .
git commit -m "Deploy setup"
git push origin main
```

2. Make sure `.env` is in `.gitignore` (don't commit secrets):
```
backend/.env
frontend/.env
```

### Step 2: Create Render Web Service

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Fill in the following:
   - **Name**: `reparts-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm run build && npm start`
   - **Plan**: `Free` (or paid for production)

### Step 3: Set Environment Variables on Render

On the Render dashboard, go to **Environment** and add these variables:

```
NODE_ENV = production
PORT = 5000
FIREBASE_PROJECT_ID = <your_firebase_project_id>
FIREBASE_PRIVATE_KEY = <your_firebase_private_key>
FIREBASE_CLIENT_EMAIL = <your_firebase_client_email>
ALGOLIA_APP_ID = <your_algolia_app_id>
ALGOLIA_ADMIN_KEY = <your_algolia_admin_key>
ALGOLIA_LISTINGS_INDEX = reparts_listings
CLOUDINARY_CLOUD_NAME = <your_cloudinary_cloud_name>
CLOUDINARY_API_KEY = <your_cloudinary_api_key>
CLOUDINARY_API_SECRET = <your_cloudinary_api_secret>
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your backend
3. Once deployed, you'll get a URL like: `https://reparts-backend.onrender.com`
4. **Copy this URL** — you'll need it for the frontend

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Select your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Set Environment Variables on Vercel

Before deploying, add these environment variables in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Add your Firebase config:

```
VITE_FIREBASE_API_KEY = <your_firebase_api_key>
VITE_FIREBASE_AUTH_DOMAIN = <your_firebase_auth_domain>
VITE_FIREBASE_PROJECT_ID = <your_firebase_project_id>
VITE_FIREBASE_STORAGE_BUCKET = <your_firebase_storage_bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID = <your_firebase_messaging_sender_id>
VITE_FIREBASE_APP_ID = <your_firebase_app_id>
VITE_FIREBASE_MEASUREMENT_ID = <your_firebase_measurement_id>
```

### Step 3: Update Backend API URL

In Vercel environment variables, add:

```
VITE_API_URL = https://reparts-backend.onrender.com
```

Or in your frontend code, update `src/lib/axios.ts` or wherever you make API calls:

```typescript
const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will automatically build and deploy your frontend
3. You'll get a URL like: `https://reparts-marketplace.vercel.app`

---

## Part 3: Configure CORS on Backend

Update `backend/src/index.ts` to allow requests from your Vercel frontend:

```typescript
app.use(
  cors({
    origin: ['https://reparts-marketplace.vercel.app', 'http://localhost:5173'],
    credentials: true,
  })
);
```

Then redeploy the backend on Render.

---

## Part 4: Firebase & Algolia Setup

### Firebase Configuration

1. Get your Firebase Admin SDK credentials:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - **Project Settings** → **Service Accounts**
   - Click **"Generate New Private Key"**
   - Copy the values into Render environment variables

2. Ensure Firestore collections exist:
   - `users` — stores user profiles
   - `listings` — stores product listings
   - `chats` — stores chat conversations (with `messages` subcollection)

### Algolia Configuration

1. Go to [Algolia Dashboard](https://www.algolia.com/apps)
2. Create an index called `reparts_listings`
3. Get your **App ID** and **Admin Key**
4. Add to Render environment variables

---

## Part 5: Test Your Deployment

1. Open your Vercel URL: `https://reparts-marketplace.vercel.app`
2. Test the following flows:
   - Sign up and create an account
   - Create a listing
   - Search for products
   - Message a seller
   - View messages (seller side)

---

## Troubleshooting

### Backend not starting on Render
- Check the **Logs** tab in Render dashboard
- Ensure all environment variables are set correctly
- Verify Firebase credentials are valid

### Frontend showing blank page
- Open browser DevTools → Console
- Check for CORS errors or API connection issues
- Verify `VITE_API_URL` is set correctly

### Messages not loading
- Ensure Firebase is configured correctly
- Check that `users`, `listings`, and `chats` collections exist in Firestore
- Verify authentication tokens are being sent with requests

### Images not uploading
- Verify Cloudinary credentials are correct
- Check Render logs for upload errors

---

## Free Tier Limitations

### Render Free Plan
- No credit card required, but limited to 1 free web service
- Services spin down after 15 minutes of inactivity (cold starts)
- Suitable for testing and low-traffic projects

### Vercel Free Plan
- 100 deployments per month
- Unlimited serverless functions
- Good performance even on free tier

### Firebase Free Plan
- 1 GB storage
- 50,000 read operations per day
- 20,000 write operations per day

---

## Next Steps

- Monitor your deployments using Render and Vercel dashboards
- Set up custom domain (optional)
- Enable auto-deployments on GitHub push
- Monitor error logs and performance

For questions or issues, check the Render and Vercel documentation!
