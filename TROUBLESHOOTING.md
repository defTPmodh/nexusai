# Auth0 Secret Error Troubleshooting

## Error: `"secret" is required`

This means Next.js isn't reading your `AUTH0_SECRET` from `.env.local`.

## Step-by-Step Fix

### 1. Verify File Location
Your `.env.local` MUST be in the project root:
```
C:\Users\tpmod\Downloads\nexusai\.env.local  ← HERE
```

NOT in:
- `app\.env.local` ❌
- `src\.env.local` ❌
- Any subfolder ❌

### 2. Check File Format
Your `.env.local` should have EXACTLY this format (no quotes, no spaces):

```env
AUTH0_SECRET=TQTNgrvtzc90JFjNpYYjFlaaL/E4FxfVsEQ/H9EduTs=
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

**Important:**
- ✅ No spaces around `=`
- ✅ No quotes around values
- ✅ No leading/trailing spaces
- ✅ Variable name is exactly `AUTH0_SECRET` (with the zero)

### 3. Restart Dev Server
Environment variables are only loaded when the server starts:
1. **Stop the server**: Press `Ctrl+C` in the terminal
2. **Start again**: `npm run dev`
3. Look for this line in the output:
   ```
   - Environments: .env.local
   ```
   If you see this, the file is being loaded.

### 4. Verify in Code (Temporary Test)
You can temporarily add this to any API route to debug:

```typescript
console.log('AUTH0_SECRET exists?', !!process.env.AUTH0_SECRET);
console.log('AUTH0_SECRET length:', process.env.AUTH0_SECRET?.length);
```

If both are undefined, the variable isn't being loaded.

### 5. Common Mistakes Checklist
- [ ] File is named `.env` instead of `.env.local`
- [ ] File is in wrong directory
- [ ] Variable name has typo (AUTH_SECRET vs AUTH0_SECRET)
- [ ] Missing `=` sign
- [ ] Extra spaces: `AUTH0_SECRET = value` (should be `AUTH0_SECRET=value`)
- [ ] Using quotes: `AUTH0_SECRET="value"` (should be `AUTH0_SECRET=value`)
- [ ] Server wasn't restarted after adding variable
- [ ] File has wrong encoding (should be UTF-8)

## Quick Test

Create a simple test file to verify env vars are loading:

1. Create `app/test-env/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasSecret: !!process.env.AUTH0_SECRET,
    secretLength: process.env.AUTH0_SECRET?.length || 0,
    hasBaseUrl: !!process.env.AUTH0_BASE_URL,
    hasIssuer: !!process.env.AUTH0_ISSUER_BASE_URL,
  });
}
```

2. Visit: http://localhost:3000/test-env
3. Check if `hasSecret: true` - if false, env vars aren't loading

## Still Not Working?

If after all checks it still doesn't work:
1. Delete `.env.local`
2. Create a new one with just:
   ```env
   AUTH0_SECRET=TQTNgrvtzc90JFjNpYYjFlaaL/E4FxfVsEQ/H9EduTs=
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
   AUTH0_CLIENT_ID=your-id
   AUTH0_CLIENT_SECRET=your-secret
   ```
3. Save it
4. Restart server: `npm run dev`

