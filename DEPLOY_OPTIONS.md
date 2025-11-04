# Deployment Options - No Git Required

Since Git is not installed, here are alternative ways to deploy to Vercel:

## Option 1: Install Git (Recommended)

### Quick Install:
1. Download Git for Windows: https://git-scm.com/download/win
2. Run the installer (use default settings)
3. Restart PowerShell/terminal
4. Then follow the normal deployment steps

## Option 2: Deploy via Vercel CLI (Easiest - No Git Needed!)

### Step 1: Install Vercel CLI
```powershell
npm install -g vercel
```

### Step 2: Login to Vercel
```powershell
vercel login
```

### Step 3: Deploy from current directory
```powershell
cd c:\Users\tpmod\Downloads\nexusai
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No (first time)
- **Project name?** → nexusai (or your choice)
- **Directory?** → ./
- **Override settings?** → No

### Step 4: Add Environment Variables
After first deployment, add environment variables:
```powershell
vercel env add AUTH0_SECRET
vercel env add AUTH0_BASE_URL
vercel env add AUTH0_ISSUER_BASE_URL
vercel env add AUTH0_CLIENT_ID
vercel env add AUTH0_CLIENT_SECRET
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENROUTER_API_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

Or add them via Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add each variable with Production, Preview, and Development selected

### Step 5: Redeploy with Environment Variables
```powershell
vercel --prod
```

## Option 3: Use GitHub Desktop (GUI Alternative)

1. Download GitHub Desktop: https://desktop.github.com/
2. Install and sign in
3. Click "Add" → "Add Existing Repository"
4. Browse to: `c:\Users\tpmod\Downloads\nexusai`
5. Publish to GitHub
6. Then import to Vercel from GitHub

## Option 4: Deploy via Vercel Dashboard (Manual Upload)

Unfortunately, Vercel doesn't support direct file upload. You'll need one of the above methods.

## Recommended: Option 2 (Vercel CLI)

This is the fastest way since you already have Node.js installed!

