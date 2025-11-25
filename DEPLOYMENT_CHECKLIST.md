# Deployment Checklist ✅

## Pre-Deployment

- [x] Code pushed to GitHub
- [x] RapidAPI key configured
- [x] AI workflow system implemented
- [x] Traffic service integrated
- [x] Railway config files created

## Railway Deployment Steps

### 1. Create Project
- [ ] Sign up/login to Railway
- [ ] Create new project from GitHub
- [ ] Select `huithrive/MetaGrowthAgent` repository

### 2. Add Services
- [ ] Add PostgreSQL database
- [ ] Add Redis database
- [ ] Verify auto-set environment variables

### 3. Configure Web Service
- [ ] Set Root Directory: `/`
- [ ] Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Set Healthcheck: `/health`

### 4. Environment Variables
- [ ] `ENVIRONMENT=production`
- [ ] `JWT_SECRET=<random-32-char-string>`
- [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}` (auto-set)
- [ ] `REDIS_URL=${{Redis.REDIS_URL}}` (auto-set)
- [ ] `GOOGLE_API_KEY=<your-key>`
- [ ] `GEMINI_MODEL=gemini-3-pro-preview`
- [ ] `RAPIDAPI_KEY=7e33689537mshbdba25e19a60d5ap1d4b02jsn6908c79` (optional, already default)
- [ ] `RAPIDAPI_HOST=similar-web-data.p.rapidapi.com` (optional, already default)

### 5. Deploy
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors
- [ ] Verify deployment successful

### 6. Get Domain
- [ ] Generate Railway domain
- [ ] Copy backend URL
- [ ] Test health endpoint: `GET /health`

### 7. Update Frontend
- [ ] Go to Vercel dashboard
- [ ] Update `VITE_API_URL` environment variable
- [ ] Redeploy frontend

### 8. Test
- [ ] Test health endpoint
- [ ] Test API docs: `/docs`
- [ ] Test workflow endpoints
- [ ] Test traffic endpoint
- [ ] Test full flow from frontend

## Post-Deployment

- [ ] Monitor logs for errors
- [ ] Test all API endpoints
- [ ] Verify CORS is working
- [ ] Check database connections
- [ ] Test AI workflow execution
- [ ] Test RapidAPI traffic analysis

## Troubleshooting

If something fails:
1. Check Railway logs
2. Verify environment variables
3. Test endpoints individually
4. Check database/Redis connections
5. Review error messages

---

**Ready to deploy?** Follow `RAILWAY_QUICK_START.md`!

