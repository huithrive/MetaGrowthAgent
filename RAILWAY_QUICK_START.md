# Railway Deployment - Quick Start Guide 🚀

## Step-by-Step Deployment

### Step 1: Sign Up / Login to Railway

1. Go to: **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (recommended - connects to your repo automatically)
4. Authorize Railway to access your repositories

### Step 2: Create New Project

1. Click **"New Project"** button
2. Select **"Deploy from GitHub repo"**
3. Find and select: **`huithrive/MetaGrowthAgent`**
4. Click **"Deploy Now"**

Railway will start deploying your project automatically!

### Step 3: Add PostgreSQL Database

1. In your project dashboard, click **"+ New"** button
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will create a PostgreSQL instance
4. **Important**: The `DATABASE_URL` environment variable is automatically set!

### Step 4: Add Redis

1. Click **"+ New"** again
2. Select **"Database"** → **"Add Redis"**
3. Railway will create a Redis instance
4. **Important**: The `REDIS_URL` environment variable is automatically set!

### Step 5: Configure Web Service

1. Click on your **Web Service** (the one that says "Deploying from GitHub")
2. Go to **"Settings"** tab
3. Scroll to **"Deploy"** section
4. Configure:
   - **Root Directory**: `/` (leave as default)
   - **Build Command**: `pip install -e .` (or leave empty, Railway auto-detects)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Healthcheck Path**: `/health` (optional but recommended)

### Step 6: Set Environment Variables

1. Go to **"Variables"** tab in your Web Service
2. Click **"+ New Variable"** for each:

#### Required Variables:
```
ENVIRONMENT=production
JWT_SECRET=your-random-secret-key-min-32-characters-long
```

#### Database Variables (Auto-set, but verify):
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

#### AI Provider Keys (At least one):
```
GOOGLE_API_KEY=your-google-api-key-here
GEMINI_MODEL=gemini-3-pro-preview
```

Optional (for Claude):
```
ANTHROPIC_API_KEY=your-anthropic-api-key
CLAUDE_MODEL=claude-3-5-sonnet-20240620
```

#### RapidAPI (Already configured, but you can override):
```
RAPIDAPI_KEY=7e33689537mshbdba25e19a60d5ap1d4b02jsn6908c79
RAPIDAPI_HOST=similar-web-data.p.rapidapi.com
```

#### Optional:
```
LLM_PROVIDER=gemini
META_ADS_TOKEN=your-meta-token
META_BUSINESS_ID=your-business-id
COMP_INTEL_API_KEY=your-competitor-api-key
```

### Step 7: Generate Domain

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Your backend URL will be: `https://your-app-name.railway.app`
4. Copy this URL! You'll need it for the frontend.

### Step 8: Wait for Deployment

1. Go to **"Deployments"** tab
2. Watch the build logs
3. Wait 2-3 minutes for deployment to complete
4. Look for: **"✓ Deployed successfully"**

### Step 9: Test Your Backend

1. **Health Check**:
   ```bash
   curl https://your-app-name.railway.app/health
   ```
   Should return: `{"status":"ok","environment":"production"}`

2. **API Docs**:
   Open in browser: `https://your-app-name.railway.app/docs`

3. **Test Workflow**:
   ```bash
   curl https://your-app-name.railway.app/workflow/providers
   ```

### Step 10: Update Frontend

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_API_URL` to: `https://your-app-name.railway.app`
5. Go to **Deployments** → Click **"..."** → **"Redeploy"**

## ✅ You're Live!

- **Frontend**: https://your-frontend.vercel.app
- **Backend**: https://your-app-name.railway.app
- **API Docs**: https://your-app-name.railway.app/docs

## Troubleshooting

### Build Fails?
- Check **Deployments** → **Logs** tab
- Verify Python version (needs 3.11+)
- Check for missing dependencies

### Database Connection Error?
- Verify `DATABASE_URL` is set (should be auto-set)
- Check PostgreSQL service is running
- Wait a few minutes for database to initialize

### API Not Responding?
- Check health endpoint: `/health`
- View logs in Railway dashboard
- Verify environment variables are set

### CORS Errors?
- Update `app/main.py` CORS settings
- Add your Vercel domain to `allow_origins`

## Next Steps

1. ✅ Test all endpoints
2. ✅ Configure custom domain (optional)
3. ✅ Set up monitoring
4. ✅ Add API rate limiting
5. ✅ Configure backups

---

**Ready?** Let's deploy! 🚀

