# Deployment Commands

Run these commands in PowerShell to deploy to Vercel:

## Step 1: Check Git Status
```powershell
cd c:\Users\tpmod\Downloads\nexusai
git status
```

## Step 2: Initialize Git (if not done)
```powershell
git init
git add .
git commit -m "Ready for Vercel deployment - Nexus-AI"
```

## Step 3: Create GitHub Repository
1. Go to https://github.com/new
2. Create repository named `nexusai` (or your preferred name)
3. **DO NOT** initialize with README
4. Copy the repository URL

## Step 4: Push to GitHub
```powershell
git remote add origin https://github.com/YOUR_USERNAME/nexusai.git
git branch -M main
git push -u origin main
```

## Step 5: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect Next.js

## Step 6: Add Environment Variables
In Vercel dashboard → Project Settings → Environment Variables, add all variables from `.env.local`

## Step 7: Update Auth0
Update callback URLs in Auth0 dashboard to your Vercel URL

## Step 8: Deploy
Click "Deploy" in Vercel dashboard

