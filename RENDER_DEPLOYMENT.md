# Render Deployment Guide (Alternative to Railway)

Render is often easier than Railway and has better error messages. Let's deploy there instead!

## Quick Deploy to Render

### Step 1: Sign Up
1. Go to: **https://render.com**
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Select **"Build and deploy from a Git repository"**
3. Connect GitHub if not already connected
4. Select: **`huithrive/MetaGrowthAgent`**
5. Click **"Connect"**

### Step 3: Configure Service
1. **Name**: `meta-growth-agent-api` (or your choice)
2. **Region**: Choose closest to you
3. **Branch**: `main`
4. **Root Directory**: `/` (leave empty)
5. **Runtime**: `Python 3`
6. **Build Command**: `pip install -r requirements.txt`
7. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 4: Add PostgreSQL
1. Click **"New +"** → **"PostgreSQL"**
2. Name: `meta-growth-agent-db`
3. Plan: **Free** (or paid if you prefer)
4. Click **"Create Database"**
5. **Copy the Internal Database URL** (we'll use this)

### Step 5: Add Redis (Optional for now)
1. Click **"New +"** → **"Redis"**
2. Name: `meta-growth-agent-redis`
3. Plan: **Free**
4. Click **"Create Redis"**
5. **Copy the Internal Redis URL**

### Step 6: Set Environment Variables
In your Web Service → **Environment** tab, add:

#### Required:
```
ENVIRONMENT=production
JWT_SECRET=<generate-random-32-char-string>
DATABASE_URL=<paste-internal-database-url-from-postgres>
REDIS_URL=<paste-internal-redis-url-from-redis>
```

#### AI Providers:
```
GOOGLE_API_KEY=<your-google-api-key>
GEMINI_MODEL=gemini-3-pro-preview
```

#### Optional:
```
ANTHROPIC_API_KEY=<your-anthropic-key>
RAPIDAPI_KEY=7e33689537mshbdba25e19a60d5ap1d4b02jsn6908c79
RAPIDAPI_HOST=similar-web-data.p.rapidapi.com
```

### Step 7: Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build
3. Render will show build logs in real-time
4. Look for: **"Your service is live"**

### Step 8: Get Your URL
1. After deployment, Render shows your URL
2. Format: `https://meta-growth-agent-api.onrender.com`
3. **Copy this URL**

### Step 9: Update Frontend
1. Go to **Vercel Dashboard**
2. Your Project → **Settings** → **Environment Variables**
3. Update `VITE_API_URL` to your Render URL
4. **Redeploy**

## Why Render Might Be Better

✅ **Better error messages** - Clearer build logs
✅ **Free tier** - PostgreSQL and Redis included
✅ **Easier setup** - More straightforward than Railway
✅ **Better docs** - Clearer instructions
✅ **Auto-deploy** - Deploys on every push

## Testing

After deployment:
```bash
# Health check
curl https://your-app.onrender.com/health

# API docs
open https://your-app.onrender.com/docs
```

## Troubleshooting

### Build Fails?
- Check build logs (very detailed on Render)
- Verify Python version (3.11+)
- Check requirements.txt has all dependencies

### Database Connection?
- Use **Internal Database URL** (not external)
- Verify DATABASE_URL is set correctly
- Wait a few minutes for database to initialize

### Still Having Issues?
- Render logs are very detailed
- Check the "Logs" tab in your service
- Render shows exact error messages

---

**Ready to try Render?** It's often easier than Railway! 🚀

