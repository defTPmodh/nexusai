# Deployment Checklist

## ✅ Pre-Deployment Checks

### Code Readiness
- [x] All code changes committed
- [x] No linter errors
- [x] .gitignore configured
- [x] Environment variables documented
- [x] Minimax model added and working
- [x] Multi-model display fixed

### Files to Review Before Commit
- [ ] Ensure `.env.local` is NOT committed (check .gitignore)
- [ ] Check no API keys are hardcoded in code
- [ ] Verify all migration files are included
- [ ] Ensure QUICK_FIX_MINIMAX.sql is included (for reference)

## 🚀 Deployment Steps

### Step 1: Initialize Git (if not done)
```powershell
cd c:\Users\tpmod\Downloads\nexusai
git init
git add .
git commit -m "Initial commit - Ready for Vercel deployment"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., `nexusai`)
3. **DO NOT** initialize with README, .gitignore, or license
4. Copy the repository URL

### Step 3: Push to GitHub
```powershell
git remote add origin https://github.com/YOUR_USERNAME/nexusai.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect Next.js

### Step 5: Add Environment Variables in Vercel
Go to Project Settings → Environment Variables and add:

**Auth0:**
- `AUTH0_SECRET` = (generate with: `openssl rand -base64 32`)
- `AUTH0_BASE_URL` = https://your-app.vercel.app
- `AUTH0_ISSUER_BASE_URL` = https://your-tenant.auth0.com
- `AUTH0_CLIENT_ID` = your-client-id
- `AUTH0_CLIENT_SECRET` = your-client-secret

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL` = https://your-project.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your-anon-key
- `SUPABASE_SERVICE_ROLE_KEY` = your-service-role-key

**OpenRouter:**
- `OPENROUTER_API_KEY` = sk-or-v1-...your-key...

**Optional:**
- `NEXT_PUBLIC_APP_URL` = https://your-app.vercel.app
- `PII_DETECTION_ENABLED` = true

### Step 6: Update Auth0 Settings
1. Go to Auth0 Dashboard → Applications → Your App
2. Update **Allowed Callback URLs**:
   ```
   https://your-app.vercel.app/api/auth/callback
   ```
3. Update **Allowed Logout URLs**:
   ```
   https://your-app.vercel.app
   ```
4. Update **Allowed Web Origins**:
   ```
   https://your-app.vercel.app
   ```

### Step 7: Deploy
Click "Deploy" in Vercel dashboard and wait for build to complete.

## 📋 Post-Deployment Verification

- [ ] Visit deployed URL
- [ ] Test authentication (sign in/out)
- [ ] Test chat functionality
- [ ] Test model selection (all models visible)
- [ ] Test multi-model mode
- [ ] Verify Minimax-M2 appears correctly
- [ ] Check analytics page loads
- [ ] Test document upload (if RAG enabled)
- [ ] Verify guardrails work

## 🔧 Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all dependencies in package.json
- Run `npm run build` locally first

### Environment Variables
- Ensure all variables added for Production environment
- Redeploy after adding variables
- Check variable names match exactly

### Auth0 Issues
- Verify callback URLs match exactly
- Check AUTH0_BASE_URL matches Vercel domain
- Ensure AUTH0_SECRET is set

## 📝 Notes

- First deployment may take 3-5 minutes
- Subsequent deployments are faster (only changed files)
- Preview deployments created for each branch/PR
- Production deployments only for main branch

