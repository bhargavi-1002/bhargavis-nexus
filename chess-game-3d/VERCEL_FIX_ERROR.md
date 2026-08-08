# 🔧 Fix Vercel Deployment Error - Quick Guide

## Error: "Invalid request: 'env' should be object"

**What went wrong**: The vercel.json file had an invalid env configuration for Vercel's import process.

**What I fixed**: 
- ✅ Removed problematic `env` field from vercel.json
- ✅ Simplified configuration for Vercel import
- ✅ Updated build commands

---

## ✅ What to Do Now on Vercel Dashboard

### Step 1: Refresh the Page
Go back to: https://vercel.com/new/import?...

The error should be gone now.

### Step 2: Configure Build Settings

**These should auto-populate. Verify:**

| Field | Value |
|-------|-------|
| Root Directory | `frontend` |
| Framework | `Next.js` |
| Build Command | `npm run build` |
| Install Command | `npm install --legacy-peer-deps` |
| Output Directory | (Leave empty) |

### Step 3: Add Environment Variables ⚠️ IMPORTANT

**BEFORE clicking Deploy**, add these environment variables:

**Option A: Via Form (Recommended)**
1. Scroll down to "Environment Variables"
2. Click "Add new"
3. Key: `NEXT_PUBLIC_API_URL`
4. Value: `http://localhost:5000` (temporary - for now)
5. Click "Add"
6. Repeat for `NEXT_PUBLIC_WS_URL` with value `ws://localhost:5000`

**Option B: Via Text Area**
1. Click "or paste the .env contents"
2. Paste:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```
3. Click "Add"

### Step 4: Deploy
Click the **Deploy** button.

---

## ⚠️ CRITICAL: After Initial Deployment

Your initial deployment will show errors because `localhost:5000` doesn't exist on Vercel.

**This is expected!** Follow these steps:

### 1. Deploy Backend First
Choose one:
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo at https://railway.app
- **Render**: https://render.com

Get your backend URL (e.g., `https://chess-api-abc123.herokuapp.com`)

### 2. Update Environment Variables in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Update `NEXT_PUBLIC_API_URL`:
   - Old: `http://localhost:5000`
   - New: `https://your-backend-url.com`
5. Update `NEXT_PUBLIC_WS_URL`:
   - Old: `ws://localhost:5000`
   - New: `wss://your-backend-url.com`
6. Save

### 3. Redeploy Frontend
1. Vercel Dashboard → Deployments
2. Click latest deployment
3. Click "Redeploy" button (top right)
4. Wait for completion

### 4. Verify
- Visit your Vercel URL
- Open DevTools (F12) → Console
- Try to create an account
- Should work now! ✅

---

## 📋 What I Changed

### Root vercel.json
✅ Removed problematic `env` array  
✅ Kept essential configuration  
✅ Set `installCommand` to include `--legacy-peer-deps`  

### frontend/vercel.json
✅ Removed env array  
✅ Simplified to minimum required fields  
✅ Updated install command  

---

## 🎯 Next Steps

1. **Refresh Vercel page** (error should be gone)
2. **Add environment variables** via the form
3. **Click Deploy**
4. **Deploy backend** to Heroku/Railway/Render
5. **Update env vars** with real backend URL
6. **Redeploy** frontend on Vercel

---

**Questions?** Check [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md)
