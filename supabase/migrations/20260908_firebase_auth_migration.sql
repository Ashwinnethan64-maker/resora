-- ==========================================================
-- RESORA DATABASE SCHEMA — MIGRATION 20260908_firebase_auth_migration.sql
-- Decouple profiles from Supabase Auth to support Firebase Authentication UIDs
-- ==========================================================

-- 1. MODIFY PROFILES TABLE TO SUPPORT FIREBASE STRING UIDs
-- Firebase UIDs are alphanumeric strings (e.g. '28-character strings' like "V4f4QeN2h...").
-- Supabase auth.users IDs were UUIDs. We decouple profiles.id from auth.users(id).

DO $$ 
BEGIN
    -- Drop the foreign key constraint referencing auth.users if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
          AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
    END IF;
END $$;

-- Ensure profiles table exists with TEXT id to accept both Firebase UIDs and UUIDs
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- If profiles was already created with UUID id, alter column type to TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
          AND column_name = 'id' 
          AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT USING id::TEXT;
    END IF;
END $$;

-- Index for lookup
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. DROP OBSOLETE SUPABASE AUTH TRIGGER
-- Firebase manages user lifecycles directly; Supabase auth triggers are no longer needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. PERMISSIVE POLICIES FOR APPLICATION CLIENT (ANON / AUTHENTICATED)
-- Data scoping is managed in application queries (WHERE user_id = :firebaseUid)
-- and verified by server API routes with Firebase session tokens.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow app profiles access" ON public.profiles;

CREATE POLICY "Allow app profiles access" ON public.profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. ENSURE USER DATA TABLES ALLOW USER-SCOPED QUERIES WITH FIREBASE UIDs
ALTER TABLE IF EXISTS public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow app resources access" ON public.resources;
CREATE POLICY "Allow app resources access" ON public.resources FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow app collections access" ON public.collections;
CREATE POLICY "Allow app collections access" ON public.collections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow app projects access" ON public.projects;
CREATE POLICY "Allow app projects access" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow app documents access" ON public.documents;
CREATE POLICY "Allow app documents access" ON public.documents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow app ai_jobs access" ON public.ai_jobs;
CREATE POLICY "Allow app ai_jobs access" ON public.ai_jobs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow app ai_conversations access" ON public.ai_conversations;
CREATE POLICY "Allow app ai_conversations access" ON public.ai_conversations FOR ALL USING (true) WITH CHECK (true);
