# Environment Variables Check

The error `"secret" is required` means Auth0 can't find `AUTH0_SECRET` in your environment.

## Quick Fix Steps

1. **Check your `.env.local` file exists** in the root directory:
   ```
   C:\Users\tpmod\Downloads\nexusai\.env.local
   ```

2. **Verify AUTH0_SECRET is set** - Your `.env.local` should have:
   ```env
   AUTH0_SECRET=TQTNgrvtzc90JFjNpYYjFlaaL/E4FxfVsEQ/H9EduTs=
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   ```

3. **Common Issues:**
   - ❌ File is named `.env` instead of `.env.local`
   - ❌ Variable name typo: `AUTH_SECRET` instead of `AUTH0_SECRET`
   - ❌ Missing `=` sign
   - ❌ Extra spaces around the `=`
   - ❌ Server wasn't restarted after adding variables

4. **Restart your dev server** after adding/updating `.env.local`:
   - Stop: Press `Ctrl+C` in terminal
   - Start: `npm run dev`

## Verify Your .env.local

Make sure your `.env.local` has ALL these variables:

```env
# Auth0 (REQUIRED)
AUTH0_SECRET=TQTNgrvtzc90JFjNpYYjFlaaL/E4FxfVsEQ/H9EduTs=
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://YOUR-TENANT.auth0.com
AUTH0_CLIENT_ID=YOUR-CLIENT-ID
AUTH0_CLIENT_SECRET=YOUR-CLIENT-SECRET

# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY

# OpenRouter (REQUIRED)
OPENROUTER_API_KEY=sk-or-v1-YOUR-KEY

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
PII_DETECTION_ENABLED=true
```

## Test If Variables Are Loaded

The server console should show:
```
- Environments: .env.local
```

If you don't see this, the file might not be in the right location.

