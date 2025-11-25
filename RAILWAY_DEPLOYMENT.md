# Railway Backend Deployment Guide

Deploy your FastAPI backend with flexible AI workflow system to Railway.

## Quick Deploy (5 minutes)

### Step 1: Sign Up / Login
1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. Authorize Railway to access your repositories

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose: `huithrive/MetaGrowthAgent`
4. Click **"Deploy Now"**

### Step 3: Add Required Services

Railway will create a web service. Now add databases:

1. **Add PostgreSQL**:
   - Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
   - Railway will create a PostgreSQL instance
   - Note the connection URL (auto-set as `DATABASE_URL`)

2. **Add Redis**:
   - Click **"+ New"** → **"Database"** → **"Add Redis"**
   - Railway will create a Redis instance
   - Note the connection URL (auto-set as `REDIS_URL`)

### Step 4: Configure Web Service

1. Click on your **Web Service**
2. Go to **"Settings"** tab
3. Configure:
   - **Root Directory**: `/` (project root)
   - **Build Command**: `pip install -e .` or `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Healthcheck Path**: `/health`

### Step 5: Set Environment Variables

Go to **"Variables"** tab and add:

#### Required:
```
ENVIRONMENT=production
JWT_SECRET=your-random-secret-key-here-min-32-chars
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

#### AI Provider Keys (at least one):
```
# For Gemini 3 support
GOOGLE_API_KEY=your-google-api-key
GEMINI_MODEL=gemini-3-pro-preview  # or gemini-1.5-pro

# For Claude support
ANTHROPIC_API_KEY=your-anthropic-api-key
CLAUDE_MODEL=claude-3-5-sonnet-20240620
```

#### Optional:
```
LLM_PROVIDER=gemini  # Default provider (claude or gemini)
META_ADS_TOKEN=your-meta-token
META_BUSINESS_ID=your-business-id
COMP_INTEL_API_KEY=your-competitor-api-key
ALERT_WEBHOOK_URL=your-webhook-url
```

### Step 6: Deploy

1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** in the dashboard
3. Wait 2-3 minutes for build

### Step 7: Get Your Backend URL

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** (or use custom domain)
3. Your backend URL: `https://your-app.railway.app`

### Step 8: Update Frontend

1. Go to **Vercel Dashboard**
2. Your Project → **Settings** → **Environment Variables**
3. Update `VITE_API_URL` to: `https://your-app.railway.app`
4. **Redeploy**

## Testing Your Deployment

### Health Check
```bash
curl https://your-app.railway.app/health
```

### API Docs
Visit: `https://your-app.railway.app/docs`

### Test Workflow Endpoints
```bash
# List available providers
curl https://your-app.railway.app/workflow/providers

# List workflow tasks
curl https://your-app.railway.app/workflow/tasks

# Execute workflow
curl -X POST https://your-app.railway.app/workflow/execute \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "meta_data": {},
    "competitor_data": {}
  }'
```

## Using Gemini 3

### Option 1: Environment Variable
Set in Railway:
```
GEMINI_MODEL=gemini-3-pro-preview
```

### Option 2: API Request
```python
# When calling workflow, specify model
{
  "task": "competitor_identification",
  "prompt": "...",
  "provider": "gemini",
  "model": "gemini-3-pro-preview"
}
```

### Option 3: Configure Workflow
```python
# POST /workflow/config
{
  "config": {
    "competitor_identification": "gemini",
    "market_gap_analysis": "claude",
    "strategic_recommendations": "claude"
  }
}
```

## Workflow Configuration

### Default Configuration
- **Competitor Identification**: Gemini (great for web research)
- **Traffic Analysis**: Gemini (data analysis)
- **Market Gap Analysis**: Claude (strategic thinking)
- **Growth Opportunities**: Claude (strategic)
- **Meta Ads Diagnostic**: Gemini (structured data)
- **Strategic Recommendations**: Claude (nuanced)
- **Executive Summary**: Claude (polished)

### Customize Per Request
```json
{
  "domain": "example.com",
  "meta_data": {...},
  "competitor_data": {...},
  "custom_config": {
    "competitor_identification": "gemini",
    "market_gap_analysis": "claude",
    "meta_ads_diagnostic": "gemini-3-pro-preview"
  }
}
```

## Monitoring

### View Logs
1. Railway Dashboard → Your Service
2. Click **"Deployments"** → Select deployment
3. View **"Logs"** tab

### Metrics
- Railway provides basic metrics in dashboard
- Add monitoring service (Datadog, Sentry) for production

## Troubleshooting

### Build Fails
- Check logs in Railway dashboard
- Verify `pyproject.toml` has all dependencies
- Check Python version (needs 3.11+)

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running
- Ensure connection string format is correct

### AI Provider Errors
- Verify API keys are set correctly
- Check provider availability: `GET /workflow/providers`
- Review logs for specific error messages

### CORS Issues
- Update `app/main.py` CORS settings
- Add your Vercel domain to `allow_origins`

## Cost Estimate

Railway pricing:
- **Hobby Plan**: $5/month (includes $5 credit)
- **Pro Plan**: $20/month (more resources)
- PostgreSQL: Included in plan
- Redis: Included in plan

## Next Steps

1. ✅ Test all endpoints
2. ✅ Configure custom domains
3. ✅ Set up monitoring
4. ✅ Add API rate limiting
5. ✅ Configure backups

---

**Your backend is now live!** 🚀

