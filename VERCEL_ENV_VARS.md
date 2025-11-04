# Vercel Environment Variables - Quick Add Guide

## Step 1: Add Environment Variables via Vercel Dashboard

1. Go to: https://vercel.com/deftpmodhs-projects/nexusai/settings/environment-variables
2. Add each variable below (select Production, Preview, and Development for each)

## Required Environment Variables

### Auth0 (5 variables)
```
AUTH0_SECRET=<your-auth0-secret>
AUTH0_BASE_URL=https://nexusai-ewffsbh63-deftpmodhs-projects.vercel.app
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=<your-client-id>
AUTH0_CLIENT_SECRET=<your-client-secret>
```

### Supabase (3 variables)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### OpenRouter (1 variable)
```
OPENROUTER_API_KEY=sk-or-v1-...your-key...
```

### Optional (2 variables)
```
NEXT_PUBLIC_APP_URL=https://nexusai-ewffsbh63-deftpmodhs-projects.vercel.app
PII_DETECTION_ENABLED=true
```

## Step 2: Update Auth0 Settings

1. Go to Auth0 Dashboard → Applications → Your App
2. Update **Allowed Callback URLs**:
   ```
   https://nexusai-ewffsbh63-deftpmodhs-projects.vercel.app/api/auth/callback
   ```
3. Update **Allowed Logout URLs**:
   ```
   https://nexusai-ewffsbh63-deftpmodhs-projects.vercel.app
   ```
4. Update **Allowed Web Origins**:
   ```
   https://nexusai-ewffsbh63-deftpmodhs-projects.vercel.app
   ```

## Step 3: Redeploy

After adding environment variables, redeploy:
```powershell
vercel --prod
```

Or trigger a new deployment from Vercel Dashboard → Deployments → Redeploy

## Step 4: Verify

Visit: https://nexusai-ewffsbh63-deftpmodhs-projects.vercel.app

## Notes

- Make sure to add variables for **all environments** (Production, Preview, Development)
- After adding variables, you MUST redeploy for them to take effect
- Your app URL may change after first deployment - check Vercel dashboard for the final URL

