# Vercel Deployment Guide

This guide will help you deploy Nexus-AI to Vercel.

## Prerequisites

- GitHub account (for connecting to Vercel)
- Vercel account (sign up at [vercel.com](https://vercel.com))
- All API keys and environment variables ready

## Step 1: Push to GitHub

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration

## Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

### Required Environment Variables

```env
# Auth0 Configuration
AUTH0_SECRET=<generate-random-32-char-string>
AUTH0_BASE_URL=https://your-app.vercel.app
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=<your-auth0-client-id>
AUTH0_CLIENT_SECRET=<your-auth0-client-secret>

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-...your-openrouter-key...

# Optional but Recommended
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
PII_DETECTION_ENABLED=true
```

### How to Add Environment Variables in Vercel

1. Go to your project → **Settings** → **Environment Variables**
2. Add each variable one by one
3. Select environments: **Production**, **Preview**, and **Development**
4. Click **Save**

## Step 4: Update Auth0 Configuration

After deployment, update your Auth0 application settings:

1. Go to Auth0 Dashboard → **Applications** → Your App
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

## Step 5: Deploy

1. Vercel will automatically deploy on push to main branch
2. Or click **"Deploy"** button in Vercel dashboard
3. Wait for build to complete (usually 2-3 minutes)

## Step 6: Verify Deployment

1. Visit your deployed URL: `https://your-app.vercel.app`
2. Test authentication flow
3. Test chat functionality
4. Check browser console for errors

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Auth0 callback URLs are updated
- [ ] Supabase database migrations are run
- [ ] Seed data is populated
- [ ] Authentication works
- [ ] Chat functionality works
- [ ] Model selection works
- [ ] RAG document upload works (if using)
- [ ] Analytics page loads correctly

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run build` locally

### Environment Variables Not Working

- Ensure variables are added for **Production** environment
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Auth0 Redirect Issues

- Verify callback URLs match exactly
- Check `AUTH0_BASE_URL` matches your Vercel domain
- Ensure `AUTH0_SECRET` is set

### Database Connection Issues

- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Ensure migrations are run in Supabase

## Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH0_SECRET` | ✅ | Random 32+ character string for session encryption |
| `AUTH0_BASE_URL` | ✅ | Your Vercel app URL |
| `AUTH0_ISSUER_BASE_URL` | ✅ | Your Auth0 tenant URL |
| `AUTH0_CLIENT_ID` | ✅ | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | ✅ | Auth0 application client secret |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `OPENROUTER_API_KEY` | ✅ | OpenRouter API key |
| `NEXT_PUBLIC_APP_URL` | ⚠️ | Your Vercel app URL (recommended) |
| `PII_DETECTION_ENABLED` | ⚠️ | Enable PII detection (default: true) |

## Custom Domain (Optional)

1. Go to Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Update Auth0 callback URLs with new domain
4. Update `AUTH0_BASE_URL` and `NEXT_PUBLIC_APP_URL` environment variables

## Continuous Deployment

Vercel automatically deploys on:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment
- Pull requests → Preview deployment

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Auth0 Next.js SDK](https://auth0.com/docs/quickstart/webapp/nextjs)

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure database migrations are complete

