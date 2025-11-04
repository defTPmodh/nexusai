# Getting Admin Access

You're getting 403 errors because your user account has the `employee` role, but admin endpoints require `admin` role.

## Quick Fix - Promote to Admin

### Option 1: Via API (Easiest)

1. Make sure you're logged in
2. Visit: http://localhost:3000/api/admin/promote
3. Or use this in your browser console while logged in:
   ```javascript
   fetch('/api/admin/promote', { method: 'POST' }).then(r => r.json()).then(console.log)
   ```

This will promote your user to `admin` role.

### Option 2: Via Supabase SQL

1. Go to your Supabase project → SQL Editor
2. Run this query (replace `YOUR-AUTH0-ID` with your Auth0 user ID):
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE auth0_id = 'YOUR-AUTH0-ID';
   ```

To find your Auth0 ID:
- Check your browser's Application tab → Cookies → look for Auth0 session
- Or check the `/api/user/profile` endpoint response

### Option 3: Update in Auth0

If you want to set default role based on Auth0 metadata:
1. Go to Auth0 Dashboard → User Management
2. Edit your user
3. Add to `app_metadata`: `{ "role": "admin" }`
4. Update the API to read from Auth0 metadata

## Verify

After promoting:
1. Refresh your browser
2. Try accessing `/admin/documents` or `/admin/analytics`
3. Should work now!

## Production Note

In production, you should:
- Remove or protect the `/api/admin/promote` endpoint
- Only allow existing admins to promote users
- Or set roles through Auth0 user metadata

