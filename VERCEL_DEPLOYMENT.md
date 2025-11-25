# Vercel Deployment Guide

This guide will help you deploy the Meta Growth Agent frontend to Vercel.

## Prerequisites

- ✅ Vercel account (you have this!)
- GitHub repository connected (already done: https://github.com/huithrive/MetaGrowthAgent)

## Deployment Steps

### 1. Deploy Frontend to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Repository**
   - Select "Import Git Repository"
   - Choose `huithrive/MetaGrowthAgent`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `frontend` ⚠️ **Important!**
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Environment Variables**
   Add these in the Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```
   
   ⚠️ **Note**: You'll need to deploy your backend first to get the URL. See "Backend Deployment" below.

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (first time)
# - Project name? meta-growth-agent (or your choice)
# - Directory? ./
# - Override settings? No
```

### 2. Backend Deployment Options

Since FastAPI + Celery requires persistent processes, Vercel Serverless Functions aren't ideal. Here are better options:

#### Option A: Railway (Recommended - Easy Setup)

1. **Go to Railway**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Select Repository**: `huithrive/MetaGrowthAgent`
4. **Configure**:
   - Root Directory: `/` (project root)
   - Build Command: `pip install -r requirements.txt` (or `pip install -e .`)
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Add Services**:
   - PostgreSQL (for database)
   - Redis (for Celery)
6. **Environment Variables**:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   JWT_SECRET=your-secret-key-here
   ENVIRONMENT=production
   META_ADS_TOKEN=your-token
   ANTHROPIC_API_KEY=your-key
   GOOGLE_API_KEY=your-key
   ```
7. **Get Backend URL**: Railway provides a URL like `https://your-app.railway.app`

#### Option B: Render

1. **Go to Render**: https://render.com
2. **New** → **Web Service**
3. **Connect GitHub** → Select repository
4. **Configure**:
   - Name: `meta-growth-agent-api`
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Add Services**:
   - PostgreSQL database
   - Redis instance
6. **Environment Variables**: Same as Railway
7. **Get Backend URL**: `https://your-app.onrender.com`

#### Option C: Fly.io or DigitalOcean App Platform

Similar process - deploy FastAPI app with PostgreSQL and Redis.

### 3. Update Frontend Environment Variable

Once your backend is deployed:

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Settings** → **Environment Variables**
4. **Update `VITE_API_URL`**:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
   (or your actual backend URL)

5. **Redeploy**:
   - Go to **Deployments**
   - Click **"..."** on latest deployment
   - **Redeploy**

### 4. Configure CORS on Backend

Update `app/main.py` for production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend.vercel.app",
        "https://www.your-frontend.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Then redeploy backend.

## Quick Deploy Script

For Railway (if using CLI):

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Link to project
railway link

# Deploy
railway up
```

## Domain Setup (Optional)

### Frontend Custom Domain
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Follow DNS instructions

### Backend Custom Domain
- Railway/Render support custom domains
- Configure in their dashboards

## Environment Variables Summary

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend-url.com
```

### Backend (Railway/Render)
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
ENVIRONMENT=production
META_ADS_TOKEN=...
ANTHROPIC_API_KEY=...
GOOGLE_API_KEY=...
COMP_INTEL_API_KEY=...
ALERT_WEBHOOK_URL=...
```

## Testing Production

1. **Frontend**: Visit your Vercel URL
2. **Backend Health**: `https://your-backend-url.com/health`
3. **API Docs**: `https://your-backend-url.com/docs`

## Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_URL` is set correctly
- Verify backend CORS allows your Vercel domain
- Check backend is running: `curl https://your-backend-url.com/health`

### Build fails on Vercel
- Check build logs in Vercel dashboard
- Verify `package.json` has correct scripts
- Ensure `vercel.json` is in `frontend/` directory

### Backend deployment issues
- Check logs in Railway/Render dashboard
- Verify environment variables are set
- Ensure database and Redis are connected

## Next Steps After Deployment

1. ✅ Test the full flow end-to-end
2. ✅ Set up monitoring (Vercel Analytics, Sentry, etc.)
3. ✅ Configure custom domains
4. ✅ Set up CI/CD (automatic deployments)
5. ✅ Add SSL certificates (automatic on Vercel)

## Cost Estimates

- **Vercel (Frontend)**: Free tier is generous (100GB bandwidth)
- **Railway**: ~$5-20/month (depending on usage)
- **Render**: Free tier available, then ~$7/month

---

**Ready to deploy?** Start with the frontend on Vercel, then set up the backend on Railway or Render!

