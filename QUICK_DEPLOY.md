# Quick Deploy to Vercel - Step by Step

## Step 1: Login to Vercel
```powershell
vercel login
```
This will open your browser to authenticate.

## Step 2: Deploy
```powershell
cd c:\Users\tpmod\Downloads\nexusai
vercel
```

Answer the prompts:
- **Set up and deploy?** → **Y** (Yes)
- **Which scope?** → Select your account
- **Link to existing project?** → **N** (No - first time)
- **What's your project's name?** → **nexusai** (or press Enter for default)
- **In which directory is your code located?** → **./** (press Enter)
- **Want to override the settings?** → **N** (No)

## Step 3: Add Environment Variables

After deployment, you need to add environment variables. Copy these commands and run them one by one (you'll be prompted to enter each value):

```powershell
# Auth0 Variables
vercel env add AUTH0_SECRET production
vercel env add AUTH0_BASE_URL production
vercel env add AUTH0_ISSUER_BASE_URL production
vercel env add AUTH0_CLIENT_ID production
vercel env add AUTH0_CLIENT_SECRET production

# Supabase Variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# OpenRouter
vercel env add OPENROUTER_API_KEY production

# Optional
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add PII_DETECTION_ENABLED production
```

**For each variable:**
- Enter the value when prompted
- Press Enter

**Note:** Add each variable for all environments:
- After adding for `production`, also add for `preview` and `development`:
```powershell
vercel env add VARIABLE_NAME preview
vercel env add VARIABLE_NAME development
```

## Step 4: Update Auth0 Settings

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

## Step 5: Redeploy with Environment Variables
```powershell
vercel --prod
```

## Step 6: Visit Your App
Your app will be live at: `https://your-app.vercel.app`

## Alternative: Add Variables via Dashboard

Instead of CLI, you can add environment variables via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable
5. Select: Production, Preview, Development
6. Redeploy

