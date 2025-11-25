# Fix Vercel Deployment Size Error

## Problem
Vercel is trying to deploy the entire repository (including backend), causing the 250MB limit error.

## Solution

### Option 1: Update Vercel Project Settings (Recommended)

1. **Go to Vercel Dashboard** → Your Project → **Settings**
2. **General** → **Root Directory**
3. **Set Root Directory to**: `frontend`
4. **Save**
5. **Redeploy**

This tells Vercel to ONLY deploy the frontend folder, ignoring everything else.

### Option 2: Use Vercel CLI with Root Directory

```bash
cd frontend
vercel --prod
```

When prompted:
- Set root directory? **Yes** → `frontend`
- Override settings? **No**

### Option 3: Create a Separate Frontend-Only Branch

```bash
# Create a new branch with only frontend
git checkout --orphan frontend-only
git rm -rf app infrastructure scripts tests docs *.md *.toml Makefile
git add frontend/
git commit -m "Frontend only for Vercel"
git push origin frontend-only
```

Then deploy the `frontend-only` branch to Vercel.

## What We've Done

✅ Created `.vercelignore` files to exclude backend
✅ Updated `vercel.json` configuration
✅ Ensured `node_modules` is in `.gitignore`

## Next Steps

1. **Go to Vercel Dashboard**
2. **Project Settings** → **General**
3. **Root Directory**: Change to `frontend`
4. **Save and Redeploy**

This should fix the size issue!

