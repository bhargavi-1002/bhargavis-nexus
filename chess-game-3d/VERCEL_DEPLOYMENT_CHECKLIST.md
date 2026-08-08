# 🚀 Vercel Deployment Checklist

## Step 1: Project Configuration (On Vercel Dashboard)

### Framework & Build Settings

**Root Directory**: Leave as `/` (default - Vercel auto-detects Next.js in frontend/)

**Build Command**:
```
cd frontend && npm run build
```

**Install Command**:
```
npm install --legacy-peer-deps
```

**Output Directory**: Leave empty (Next.js auto-configures)

---

## Step 2: Environment Variables (REQUIRED ⚠️)

### For Production Environment

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

| Key | Value | Type |
|-----|-------|------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.com` | **Production** |
| `NEXT_PUBLIC_WS_URL` | `wss://your-backend-url.com` | **Production** |

### ⚠️ IMPORTANT: Backend URL Setup FIRST

**You must deploy backend BEFORE setting these!** Here's the order:

1. **Deploy backend first** to Heroku/Railway/Render
2. **Get backend URL** (e.g., `https://chess-api-abc123.herokuapp.com`)
3. **Return to Vercel** and add environment variables
4. **Redeploy frontend** to apply new URLs

---

## Step 3: Root Directory Configuration

### Option A: Single Root (Recommended for Frontend Only)
```
Root Directory: frontend
```

### Option B: Multiple Services (Monorepo)
Requires `vercel.json` with this structure:
```json
{
  "buildCommand": "cd frontend && npm run build",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url",
    "NEXT_PUBLIC_WS_URL": "@next_public_ws_url"
  }
}
```

---

## Step 4: Deployment Process

### Initial Deployment

```bash
# Option 1: Via Vercel CLI (Recommended)
npm install -g vercel
cd chess-game-3d
vercel                          # Follow interactive prompts
```

### Verify Deployment

After deployment completes:

1. ✅ Visit deployment URL
2. ✅ Check authentication page loads
3. ✅ Open browser DevTools → Console
4. ✅ Look for any errors
5. ✅ Try creating an account

### Troubleshooting Deployment

**Error: "Build failed"**
- Run locally: `cd frontend && npm run build`
- Fix errors shown
- Push to GitHub: `git push origin main`
- Vercel will auto-redeploy

**Error: "Cannot find module"**
- Check `npm install --legacy-peer-deps` is used
- Verify package.json has all dependencies
- Clear cache: Vercel Settings → Advanced → Clear Build Cache

**Error: "API endpoint not found"**
- Check NEXT_PUBLIC_API_URL is set correctly
- Verify backend is deployed and running
- Test URL in browser: `curl https://your-backend-url.com/health`

---

## Step 5: Backend Deployment (Separate)

### Option A: Heroku (Recommended)

```bash
cd backend

# Create Heroku app
heroku create chess-game-api

# Set environment variables
heroku config:set MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/chess"
heroku config:set JWT_SECRET="your-secret-key-32-chars-min"
heroku config:set FRONTEND_URL="https://chess-game-3d.vercel.app"

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

**Get Backend URL**: `https://chess-game-api.herokuapp.com`

### Option B: Railway.app (Modern Alternative)

1. Go to https://railway.app
2. Connect GitHub account
3. Import chess-game-3d repository
4. Create MongoDB plugin
5. Set environment variables in dashboard
6. Deploy automatically

**Get Backend URL**: Shown in Railway dashboard

### Option C: Render.com

1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Set backend folder: `backend`
5. Set environment variables
6. Deploy

---

## Step 6: Connect Frontend to Backend

### Update Vercel Environment Variables

After backend is deployed:

1. **Get backend URL** (e.g., `https://chess-game-api.herokuapp.com`)
2. **Go to Vercel Dashboard**
3. **Settings → Environment Variables**
4. **Update/Add**:
   ```
   NEXT_PUBLIC_API_URL = https://chess-game-api.herokuapp.com
   NEXT_PUBLIC_WS_URL = wss://chess-game-api.herokuapp.com
   ```
5. **Redeploy**: Go to Deployments → Latest → Redeploy

---

## Step 7: Verify Connection

### Test Frontend → Backend

1. Open deployed frontend: `https://chess-game-3d.vercel.app`
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Try registering an account
5. Check Network tab for API calls
6. Verify calls go to your backend URL

### Test API Endpoints

```bash
# Health check
curl https://your-backend-url.com/health

# Get daily puzzle
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-backend-url.com/api/puzzles/daily

# Get leaderboard
curl https://your-backend-url.com/api/users/leaderboard/top
```

---

## Step 8: Production Best Practices

### Enable HTTPS ✅
- Vercel: Automatic (always enabled)
- Backend: Use HTTPS URLs only

### Monitor Logs 📊
- **Vercel**: Dashboard → Deployments → Logs
- **Heroku**: `heroku logs --tail`
- **Railway**: Dashboard → Logs

### Set up Error Tracking (Optional)
- Sentry.io (recommended)
- LogRocket
- Datadog

### Backup Database 🔒
- MongoDB Atlas: Auto-backups enabled
- Set up additional backups
- Test restore process monthly

---

## 📋 Configuration Checklist

### Vercel Dashboard

- [ ] Project name set correctly
- [ ] GitHub repository connected
- [ ] Root directory configured (if monorepo)
- [ ] Build command: `cd frontend && npm run build`
- [ ] Install command: `npm install --legacy-peer-deps`
- [ ] Environment variables set:
  - [ ] `NEXT_PUBLIC_API_URL`
  - [ ] `NEXT_PUBLIC_WS_URL`
- [ ] Auto-deployment enabled for main branch
- [ ] Redeploy after env vars changed

### Backend Setup

- [ ] Backend deployed to Heroku/Railway/Render
- [ ] Environment variables configured:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `FRONTEND_URL`
- [ ] Database accessible
- [ ] API endpoints responding (test with curl)
- [ ] WebSocket connections working

### Post-Deployment Testing

- [ ] Frontend loads without errors
- [ ] Can create account
- [ ] Can login
- [ ] Can play vs AI
- [ ] Can view leaderboard
- [ ] Can see daily puzzle
- [ ] Console shows no errors
- [ ] Network requests go to correct backend

---

## 🆘 Support

### Common Issues & Solutions

**"Cannot GET /api/..."**
- Backend not running or URL incorrect
- Check NEXT_PUBLIC_API_URL in Vercel env vars
- Verify backend health: `curl backend-url.com/health`

**"WebSocket connection failed"**
- Backend doesn't support WebSocket
- Frontend falls back to HTTP polling (OK)
- Check NEXT_PUBLIC_WS_URL is set

**"CORS error"**
- Backend CORS not configured for frontend URL
- Contact backend admin to update CORS settings
- For self-hosted backend, add to CORS config:
  ```
  FRONTEND_URL=https://your-chess-game.vercel.app
  ```

**"Build failing after git push"**
- Check frontend/package.json is valid
- Run `npm install` locally to verify dependencies
- Run `npm run build` locally to find real errors
- Push fix to GitHub, Vercel will auto-rebuild

**"Database connection error"**
- Verify MONGODB_URI is correct
- Check MongoDB Atlas IP whitelist includes backend server
- Test connection string locally

---

## 🎯 Next: Deploy Now

### Quick Command
```bash
vercel                    # Deploy to Vercel
```

### Timeline
- Frontend → Vercel: ~2-3 minutes
- Backend → Heroku: ~5 minutes  
- Total: ~10 minutes to fully working app

**Your chess game will be live! 🎉**

---

**Questions?** Refer to:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Detailed backend deployment
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - API reference
- [README.md](./README.md) - Feature overview
