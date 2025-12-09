# Deployment Checklist - ReParts Marketplace

## Pre-Deployment Checklist

### Backend Setup
- [ ] `.env` file created with all Firebase, Algolia, and Cloudinary credentials
- [ ] `backend/.env` is added to `.gitignore` (not committed to Git)
- [ ] All npm dependencies installed: `npm install`
- [ ] Build test passes locally: `npm run build`
- [ ] Start script works: `npm start`
- [ ] API endpoints tested locally (POST /api/chat, GET /api/listings, etc.)

### Frontend Setup
- [ ] `.env` file created with Firebase config
- [ ] `frontend/.env` is added to `.gitignore`
- [ ] All npm dependencies installed: `npm install`
- [ ] Build test passes: `npm run build`
- [ ] Dev server works: `npm run dev`
- [ ] No TypeScript errors: `npm run type-check` (if available)

### Firebase Setup
- [ ] Firebase project created
- [ ] Firestore database initialized
- [ ] Collections created: `users`, `listings`, `chats`
- [ ] Firebase Admin SDK credentials obtained
- [ ] Web SDK config copied to frontend `.env`

### Algolia Setup
- [ ] Algolia account created
- [ ] `reparts_listings` index created
- [ ] App ID and Admin Key obtained

### Cloudinary Setup (Optional)
- [ ] Cloudinary account created
- [ ] Cloud name, API key, and API secret obtained

### Code Cleanup
- [ ] No console.log() or debug statements in production code
- [ ] No hardcoded API URLs (using environment variables)
- [ ] All environment variables documented in `.env.example` files
- [ ] Credentials are NOT committed to Git

---

## Render Deployment

### Step 1: GitHub Repository
- [ ] Code pushed to GitHub
- [ ] `.env` files in `.gitignore`
- [ ] Branch is `main` or specified branch

### Step 2: Render Dashboard
- [ ] Created new Web Service
- [ ] Connected GitHub repository
- [ ] Set Build Command: `cd backend && npm install`
- [ ] Set Start Command: `cd backend && npm run build && npm start`
- [ ] Added all environment variables
- [ ] Service deployed successfully

### Step 3: Render Verification
- [ ] Backend URL obtained (e.g., https://reparts-backend.onrender.com)
- [ ] `/health` endpoint returns 200 OK
- [ ] Logs show "Server is running on port 5000"

---

## Vercel Deployment

### Step 1: Vercel Dashboard
- [ ] Connected GitHub account
- [ ] Created new project
- [ ] Selected `frontend` as root directory
- [ ] Set Build Command: `npm run build`
- [ ] Set Output Directory: `dist`

### Step 2: Environment Variables
- [ ] Added all `VITE_FIREBASE_*` variables
- [ ] Added `VITE_API_URL = <render_backend_url>`
- [ ] All variables set for all environments (Production, Preview, Development)

### Step 3: Vercel Deployment
- [ ] Project deployed successfully
- [ ] Frontend URL obtained (e.g., https://reparts-marketplace.vercel.app)
- [ ] No build errors in Vercel logs

---

## Post-Deployment Testing

### Connectivity
- [ ] Frontend loads without errors
- [ ] Network requests go to correct backend URL
- [ ] CORS errors (if any) are resolved

### Authentication
- [ ] Sign up works
- [ ] Sign in works
- [ ] User created in Firestore `users` collection
- [ ] Sign out works

### Core Features
- [ ] Browse listings loads
- [ ] Create listing works
- [ ] Search functionality works
- [ ] Send message to seller works
- [ ] View messages as seller works
- [ ] Edit/delete listing works in dashboard

### Data Persistence
- [ ] Listings appear in Firestore `listings` collection
- [ ] Chats appear in Firestore `chats` collection
- [ ] Messages appear in Firestore `chats/{chatId}/messages` subcollection

### Algolia Integration
- [ ] New listings are indexed in Algolia
- [ ] Search returns results from Algolia

---

## Monitoring & Maintenance

### Weekly Checks
- [ ] Monitor Render service status
- [ ] Check Vercel deployment logs for errors
- [ ] Monitor Firebase read/write operations
- [ ] Check Algolia indexing status

### Error Tracking
- [ ] Set up error logging (e.g., Sentry)
- [ ] Monitor CORS errors
- [ ] Monitor Firebase quota usage
- [ ] Check backend response times

---

## Rollback Procedure

If something breaks after deployment:

1. **Frontend**: Go to Vercel → Deployments → Redeploy previous version
2. **Backend**: Go to Render → Manual Deploy → Previous build

---

## Common Issues & Solutions

### Backend won't start
- Check logs: `tail -f render.log`
- Verify environment variables are set
- Ensure build command completed successfully

### Frontend shows blank page
- Check browser console for errors
- Verify `VITE_API_URL` is set correctly
- Check Network tab for failed requests

### API requests fail (CORS error)
- Update `backend/src/index.ts` CORS config
- Redeploy backend
- Clear browser cache

### Messages not syncing
- Check Firebase credentials
- Verify `users` collection has entries
- Check backend logs for token verification errors

---

## Performance Optimization (Optional)

- [ ] Enable Render auto-scaling (paid plan)
- [ ] Set up Vercel analytics
- [ ] Enable Firebase caching rules
- [ ] Optimize images with Cloudinary
- [ ] Add database indexes in Firestore

---

## Security Checklist

- [ ] HTTPS enabled (automatic on both platforms)
- [ ] Environment variables never logged
- [ ] Firebase rules restrict unauthorized access
- [ ] API authentication enforced on protected endpoints
- [ ] Sensitive data (keys, tokens) never in frontend code

---

**Deployment Date**: _______________

**Deployed By**: _______________

**Frontend URL**: https://_______________

**Backend URL**: https://_______________
