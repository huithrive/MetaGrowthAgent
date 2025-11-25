# Vercel Deployment - Step by Step

## ✅ Step 1: Go to Vercel
Open: https://vercel.com/new

## ✅ Step 2: Import Repository
1. Click "Import Git Repository"
2. Select: **huithrive/MetaGrowthAgent**
3. Click "Import"

## ✅ Step 3: Configure Project Settings

**CRITICAL SETTINGS:**

1. **Framework Preset**: Vite (should auto-detect)
2. **Root Directory**: 
   - Click "Edit" next to Root Directory
   - Change from `/` to `frontend`
   - ⚠️ THIS IS CRITICAL!
3. **Build Command**: `npm run build` (auto-filled)
4. **Output Directory**: `dist` (auto-filled)
5. **Install Command**: `npm install` (auto-filled)

## ✅ Step 4: Add Environment Variable

Click "Environment Variables" and add:

- **Key**: `VITE_API_URL`
- **Value**: `http://localhost:8000` (we'll update this after backend is deployed)
- **Environments**: Production, Preview, Development (check all)

Click "Add"

## ✅ Step 5: Deploy!

Click the big "Deploy" button

Wait 2-3 minutes for build to complete...

## ✅ Step 6: Get Your URL

After deployment, you'll see:
- ✅ Deployment successful!
- Your app URL: `https://meta-growth-agent-xxxxx.vercel.app`

## Next Steps (After Backend is Deployed)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `VITE_API_URL` to your backend URL (e.g., `https://your-backend.railway.app`)
3. Redeploy

---

**Ready?** Go to https://vercel.com/new and follow these steps!

