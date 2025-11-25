# Quick Deploy to Vercel 🚀

## Step-by-Step Deployment

### 1. Push Code to GitHub (if not already done)

```bash
cd /Users/huithrive/meta-growth-agent
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 2. Deploy Frontend to Vercel

#### Via Vercel Dashboard (Easiest):

1. **Go to**: https://vercel.com/new
2. **Import Git Repository**:
   - Select `huithrive/MetaGrowthAgent`
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `frontend` ⚠️ **CRITICAL - Change this!**
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `dist` (auto)
   - **Install Command**: `npm install` (auto)

4. **Environment Variables**:
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `http://localhost:8000` (we'll update this later)
   - Click "Add"

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - ✅ Your app will be live!

### 3. Get Your Vercel URL

After deployment, you'll get a URL like:
- `https://meta-growth-agent.vercel.app`
- Or your custom domain if configured

### 4. Deploy Backend (Railway - Recommended)

The backend needs a different platform. Here's the fastest way:

#### Option A: Railway (5 minutes)

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub**
4. **Select**: `huithrive/MetaGrowthAgent`
5. **Add Services**:
   - Click "+ New" → **PostgreSQL**
   - Click "+ New" → **Redis**
6. **Configure Web Service**:
   - Click "+ New" → **GitHub Repo**
   - Select your repo
   - **Settings** → **Root Directory**: `/` (project root)
   - **Settings** → **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. **Environment Variables**:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   JWT_SECRET=change-this-to-random-string
   ENVIRONMENT=production
   ```
8. **Deploy** → Get your backend URL (e.g., `https://your-app.railway.app`)

#### Option B: Render (Alternative)

1. **Go to**: https://render.com
2. **New** → **Web Service**
3. **Connect GitHub** → Select repo
4. **Configure**:
   - Name: `meta-growth-agent-api`
   - Environment: Python 3
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Add PostgreSQL** and **Redis** services
6. **Set environment variables** (same as Railway)
7. **Deploy**

### 5. Connect Frontend to Backend

1. **Go to Vercel Dashboard**
2. **Your Project** → **Settings** → **Environment Variables**
3. **Update `VITE_API_URL`**:
   - Value: `https://your-backend-url.railway.app` (or Render URL)
   - Environment: Production, Preview, Development
4. **Save**
5. **Redeploy**:
   - Go to **Deployments**
   - Click **"..."** on latest → **Redeploy**

### 6. Update Backend CORS

Update `app/main.py` to allow your Vercel domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",  # Your Vercel URL
        "https://www.your-app.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Then commit and push:
```bash
git add app/main.py
git commit -m "Update CORS for production"
git push
```

Railway/Render will auto-redeploy.

## ✅ You're Live!

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-backend.railway.app
- **API Docs**: https://your-backend.railway.app/docs

## Testing Production

1. Visit your Vercel URL
2. Enter a website URL
3. Test the full flow!

## Troubleshooting

**Frontend shows errors?**
- Check browser console
- Verify `VITE_API_URL` is set correctly
- Check backend CORS settings

**Backend not responding?**
- Check Railway/Render logs
- Verify environment variables
- Test health endpoint: `curl https://your-backend-url.com/health`

## Next Steps

- [ ] Set up custom domain
- [ ] Configure monitoring
- [ ] Add API keys (Meta Ads, LLM, etc.)
- [ ] Set up database migrations
- [ ] Configure alerts

---

**Need help?** Check `VERCEL_DEPLOYMENT.md` for detailed instructions.

