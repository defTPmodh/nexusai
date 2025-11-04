# Supabase Setup Guide

Complete guide to set up your Supabase database for Nexus-AI.

## Step 1: Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign in"**
3. Sign up/login with GitHub, Google, or email
4. Click **"New Project"**
5. Fill in project details:
   - **Name**: `nexusai` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for MVP
6. Click **"Create new project"**
7. Wait 2-3 minutes for project to initialize

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (keep this secret!)

3. Copy these values - you'll need them for `.env.local`

## Step 3: Enable pgvector Extension

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Paste this SQL:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

4. Click **"Run"** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

## Step 4: Run Database Migrations

Run each migration file **in order**:

### Migration 1: Initial Schema

1. In SQL Editor, click **"New query"**
2. Open `supabase/migrations/001_initial_schema.sql`
3. Copy **ALL** the contents
4. Paste into SQL Editor
5. Click **"Run"**
6. Wait for completion - should see "Success"

### Migration 2: Vector Search Function

1. Click **"New query"** again
2. Open `supabase/migrations/002_vector_search_function.sql`
3. Copy all contents
4. Paste and run
5. Should see "Success"

### Migration 3: Analytics Function

1. Click **"New query"**
2. Open `supabase/migrations/003_analytics_function.sql`
3. Copy all contents
4. Paste and run
5. Should see "Success"

## Step 5: Seed Initial Data

1. Click **"New query"**
2. Open `supabase/seed.sql`
3. Copy **ALL** contents
4. Paste into SQL Editor
5. Click **"Run"**

This will create:
- 3 LLM models (NVIDIA, DeepSeek, OpenAI)
- Model permissions for all roles

You should see messages like:
- "INSERT 0 3" (for models)
- "INSERT 0 3" (for each role's permissions)

## Step 6: Verify Setup

Run these queries to verify everything is set up:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if models were inserted
SELECT * FROM llm_models;

-- Check if permissions were created
SELECT mp.*, lm.display_name, mp.role 
FROM model_permissions mp 
JOIN llm_models lm ON mp.model_id = lm.id;
```

You should see:
- All tables listed
- 3 models in `llm_models`
- 9 permission rows (3 models × 3 roles)

## Step 7: Update .env.local

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key...
```

**Important**: 
- `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - The "anon public" key (safe for client-side)
- `SUPABASE_SERVICE_ROLE_KEY` - The "service_role" key (KEEP SECRET - server-side only!)

## Troubleshooting

### "Extension vector does not exist"
- Make sure you ran the `CREATE EXTENSION vector;` command first

### "relation already exists"
- Some tables might already exist. This is okay, just continue with next migration

### "duplicate key value"
- Seed data might have been run twice. This is okay, the `ON CONFLICT DO NOTHING` will handle it

### "permission denied"
- Make sure you're running queries as the project owner
- Check that your SQL Editor has proper permissions

### Model names not appearing
- Run the seed.sql again - it has `ON CONFLICT DO NOTHING` so it's safe to rerun

## Next Steps

After Supabase is set up:
1. ✅ Database tables created
2. ✅ Models seeded
3. ✅ Environment variables configured

You can now:
- Set up Auth0
- Start the dev server: `npm run dev`
- Test the chat interface with your models!

## Quick Reference

- **Supabase Dashboard**: https://app.supabase.com
- **SQL Editor**: Dashboard → SQL Editor
- **API Settings**: Dashboard → Settings → API
- **Table Editor**: Dashboard → Table Editor (to view data)

