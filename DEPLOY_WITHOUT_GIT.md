# Deploy to Vercel Without Git

Since Git is not installed, here are two options:

## Option 1: Install Git (Recommended)

### Install Git for Windows:
1. Download Git from: https://git-scm.com/download/win
2. Run the installer (use default settings)
3. Restart PowerShell after installation
4. Then follow the git commands in `DEPLOY_COMMANDS.md`

## Option 2: Deploy Directly with Vercel CLI

### Step 1: Install Vercel CLI
```powershell
npm install -g vercel
```

### Step 2: Login to Vercel
```powershell
vercel login
```

### Step 3: Deploy
```powershell
cd c:\Users\tpmod\Downloads\nexusai
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (select your account)
- Link to existing project? **No**
- Project name? **nexusai** (or your preferred name)
- Directory? **./** (current directory)
- Override settings? **No**

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

For each variable, select:
- **Production** environment
- Enter the value when prompted

### Step 5: Redeploy with Environment Variables
```powershell
vercel --prod
```

## Option 3: Manual Upload via Vercel Dashboard

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"** → **"Continue with GitHub"**
3. Instead, click **"Deploy without Git"** (if available) OR
4. Create a ZIP file and upload:
   ```powershell
   cd c:\Users\tpmod\Downloads
   Compress-Archive -Path nexusai -DestinationPath nexusai.zip -Force
   ```
5. Upload `nexusai.zip` to Vercel (extract first, then upload folder)

## Recommended: Use Option 1 (Install Git)

Git is the easiest and most standard way to deploy. It takes 2 minutes to install and makes future deployments much easier.

