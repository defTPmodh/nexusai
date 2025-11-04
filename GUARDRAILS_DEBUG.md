# Guardrails Debugging Guide

## Check if Guardrails are Working

### Step 1: Verify Guardrail Configuration

1. Go to `/admin/guardrails` page
2. Check that:
   - ✅ **Enabled** toggle is ON
   - ✅ **Email** checkbox is checked (or other PII types you want)
   - ✅ **Action** is set to `block`, `warn`, or `redact`
3. Click **Save**

### Step 2: Check Your User Role

Guardrails are **bypassed for admins**. To test:

1. Check your role: Go to `/api/user/role` or check the database
2. If you're an admin, you need to:
   - Either test with a non-admin account
   - Or temporarily change your role to `employee` in the database

### Step 3: Test PII Detection

Try sending a message with PII:

**Email:**
```
Write an email to tpmodh@gmail.com about the new product launch
```

**Phone:**
```
Call me at 555-123-4567
```

**SSN:**
```
My SSN is 123-45-6789
```

### Step 4: Check Console Logs

Open browser DevTools → Console, or check server logs for:
- `[GUARDRAIL] Config loaded:` - Shows guardrail config
- `[GUARDRAIL] ✅ PII detected` - PII was found
- `[GUARDRAIL] ❌ No PII detected` - No PII found

### Step 5: Verify Database Configuration

Run this SQL in Supabase to check guardrail config:

```sql
SELECT * FROM guardrails WHERE name = 'default';
```

Should return:
- `enabled = true`
- `pii_types` contains `['email', 'phone', 'ssn', ...]`
- `action` is `'block'`, `'warn'`, or `'redact'`

### Step 6: Fix Common Issues

**Issue: Guardrails not enabled**
- Go to `/admin/guardrails` and enable them

**Issue: User is admin**
- Admins bypass guardrails for testing
- Change role to `employee` or test with non-admin account

**Issue: No default guardrail**
- Create one via `/admin/guardrails` page
- Or run this SQL:
```sql
INSERT INTO guardrails (name, enabled, pii_types, action, allowlist_patterns, created_by)
VALUES (
  'default',
  true,
  ARRAY['email', 'phone', 'ssn', 'credit_card', 'ip_address'],
  'redact',
  ARRAY[]::text[],
  (SELECT id FROM users LIMIT 1)
);
```

**Issue: Email regex not matching**
- Fixed: Changed `[A-Z|a-z]` to `[A-Za-z]` in email regex
- Fixed: Added `i` flag for case-insensitive matching

## Expected Behavior

### Action: `block`
- Request is blocked with 403 error
- User sees: "PII detected. Request blocked by guardrails."

### Action: `warn`
- Request continues
- Warning logged in console
- Original message sent to LLM

### Action: `redact`
- PII is replaced with `[EMAIL REDACTED]`, `[PHONE REDACTED]`, etc.
- Redacted message sent to LLM
- User sees response but PII was removed from their prompt

