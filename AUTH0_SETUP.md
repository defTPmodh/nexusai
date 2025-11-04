# Auth0 Setup Guide

Complete guide to set up Auth0 authentication for Nexus-AI.

## Step 1: Create Auth0 Account

1. Go to [auth0.com](https://auth0.com)
2. Click **"Sign Up"** (free tier is fine for MVP)
3. Choose:
   - **Sign up with email** (recommended), or
   - Sign up with GitHub/Google
4. Verify your email if required

## Step 2: Create a New Application

1. Once logged in, you'll be in the **Auth0 Dashboard**
2. In the left sidebar, click **Applications**
3. Click **"Create Application"** button
4. Fill in:
   - **Name**: `Nexus-AI` (or any name)
   - **Application Type**: Select **"Regular Web Application"**
5. Click **"Create"**

## Step 3: Configure Application Settings

After creating, you'll see your application settings. Configure:

### Application Settings Tab

1. **Allowed Callback URLs**:
   ```
   http://localhost:3000/api/auth/callback,http://localhost:3000
   ```

2. **Allowed Logout URLs**:
   ```
   http://localhost:3000
   ```

3. **Allowed Web Origins**:
   ```
   http://localhost:3000
   ```

4. **Allowed Origins (CORS)**:
   ```
   http://localhost:3000
   ```

### Important Notes:
- For production, add your production URLs (e.g., `https://yourdomain.com/api/auth/callback`)
- Separate multiple URLs with commas
- Click **"Save Changes"** after updating

## Step 4: Get Your Credentials

On the same **Settings** tab, you'll find:

1. **Domain**: `your-tenant.auth0.com` (or `your-tenant.us.auth0.com`)
2. **Client ID**: Long alphanumeric string
3. **Client Secret**: Click **"Show"** to reveal it (save this securely!)

Copy these values - you'll need them for `.env.local`

## Step 5: Configure Auth0 Secret

You need to generate a random 32-character string for `AUTH0_SECRET`:

### Option 1: Using OpenSSL (if installed)
```bash
openssl rand -base64 32
```

### Option 2: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option 3: Online Generator
Visit: https://generate-secret.vercel.app/32

Copy the generated string.

## Step 6: Update .env.local

Add these to your `.env.local` file:

```env
# Auth0 Configuration
AUTH0_SECRET=<paste-your-32-char-random-string-here>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=<paste-client-id-here>
AUTH0_CLIENT_SECRET=<paste-client-secret-here>
```

### Example:
```env
AUTH0_SECRET=abc123xyz789randomstring32chars
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://dev-abc123.us.auth0.com
AUTH0_CLIENT_ID=abc123xyz789
AUTH0_CLIENT_SECRET=def456uvw012_secret_key_here
```

## Step 7: (Optional) Set Up Roles

For role-based access control:

1. In Auth0 Dashboard, go to **User Management** → **Roles**
2. Click **"Create Role"**
3. Create three roles:
   - **employee**
   - **manager**
   - **admin**
4. Save each role

### Assign Roles to Users

1. Go to **User Management** → **Users**
2. Click on a user
3. Go to **Roles** tab
4. Click **"Assign Roles"**
5. Select the role(s) and assign

**Note**: For MVP, you can skip this. The app defaults new users to `employee` role.

## Step 8: (Optional) Configure Social Connections

If you want Google/GitHub login:

1. Go to **Authentication** → **Social**
2. Click on the connection (e.g., "Google")
3. Enable it and configure credentials
4. Add it to your Application (Applications → Your App → Connections)

## Step 9: Test the Setup

1. Make sure your `.env.local` is configured
2. Start your dev server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000
4. Click **"Sign In with SSO"**
5. You should be redirected to Auth0 login
6. After login, you'll be redirected back

## Step 10: (Optional) Enterprise SSO Setup

For SAML/OAuth enterprise connections:

1. Go to **Authentication** → **Enterprise**
2. Click **"+ Create Connection"**
3. Choose connection type:
   - **SAML** for SAML SSO
   - **OAuth** for OAuth providers
4. Configure with your enterprise settings
5. Enable for your Application in **Applications** → **Connections**

## Troubleshooting

### "Invalid redirect URI"
- Check that `http://localhost:3000/api/auth/callback` is in **Allowed Callback URLs**
- Make sure there are no extra spaces or typos
- For production, add your production URL

### "Client authentication failed"
- Verify `AUTH0_CLIENT_SECRET` is correct
- Make sure you copied the entire secret (might be long)
- Check for any extra spaces

### "AUTH0_SECRET is missing"
- Make sure `.env.local` exists in project root
- Verify the variable name is exactly `AUTH0_SECRET`
- Restart your dev server after changing `.env.local`

### "Invalid issuer"
- Check `AUTH0_ISSUER_BASE_URL` format:
  - Should be: `https://your-tenant.auth0.com`
  - Or: `https://your-tenant.us.auth0.com`
- Don't include trailing slash

### User not created in database
- First login automatically creates user in Supabase
- Make sure Supabase is properly configured
- Check browser console for errors

## Production Checklist

When deploying to production:

- [ ] Update `AUTH0_BASE_URL` to production URL
- [ ] Add production callback URLs in Auth0
- [ ] Use secure `AUTH0_SECRET` (different from dev)
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up proper logout URLs
- [ ] Test all authentication flows

## Quick Reference

- **Auth0 Dashboard**: https://manage.auth0.com
- **Documentation**: https://auth0.com/docs
- **Application Settings**: Dashboard → Applications → Your App → Settings
- **Users**: Dashboard → User Management → Users
- **Roles**: Dashboard → User Management → Roles

## Security Best Practices

1. ✅ Never commit `.env.local` to git (already in `.gitignore`)
2. ✅ Use different secrets for dev/prod
3. ✅ Rotate `AUTH0_SECRET` periodically
4. ✅ Keep Client Secret secure (server-side only)
5. ✅ Use HTTPS in production
6. ✅ Regularly review Auth0 logs for suspicious activity

