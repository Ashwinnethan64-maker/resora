-- ==============================================================================
-- RESORA DATABASE SCHEMA — MIGRATION 20260908_multi_user_isolation.sql
-- Production Multi-User Isolation & Firebase UID Keying
-- Non-destructive: preserves all existing data and tables
-- ==============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADAPT PROFILES TABLE (Keyed directly on Firebase UID)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    firebase_uid TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure profiles.id and firebase_uid are indexed
CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON public.profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- If profiles was already created with UUID id, convert column safely to TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
          AND column_name = 'id' 
          AND data_type = 'uuid'
    ) THEN
        -- Remove legacy foreign key if any
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
        ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT USING id::TEXT;
    END IF;

    -- Ensure firebase_uid column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
          AND column_name = 'firebase_uid'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN firebase_uid TEXT;
        UPDATE public.profiles SET firebase_uid = id WHERE firebase_uid IS NULL;
        ALTER TABLE public.profiles ALTER COLUMN firebase_uid SET NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_firebase_uid ON public.profiles(firebase_uid);
    END IF;
END $$;

-- 2. SAFELY CONVERT USER_ID TO TEXT ACROSS ALL USER TABLES
-- Firebase UIDs are alphanumeric strings (e.g. 28 chars), so user_id must be TEXT.
DO $$
BEGIN
    -- resources.user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resources' AND column_name = 'user_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.resources ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;

    -- tags.user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tags' AND column_name = 'user_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.tags ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;

    -- use_cases.user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'use_cases' AND column_name = 'user_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.use_cases ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;

    -- collections.user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'collections' AND column_name = 'user_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.collections ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;

    -- projects.user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'user_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.projects ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;

    -- documents.user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'user_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.documents ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;

    -- ai_jobs.user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_jobs' AND column_name = 'user_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.ai_jobs ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;

    -- ai_conversations.user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_conversations' AND column_name = 'user_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.ai_conversations ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;
END $$;

-- 3. OPTIMIZE COMPOSITE INDEXES FOR PER-USER RETRIEVAL VELOCITY
CREATE INDEX IF NOT EXISTS idx_resources_user_created ON public.resources(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_user_archived ON public.resources(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_resources_user_favorite ON public.resources(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_resources_user_inbox ON public.resources(user_id, is_inbox);
CREATE INDEX IF NOT EXISTS idx_projects_user_created ON public.projects(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collections_user_created ON public.collections(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_created ON public.documents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_hash ON public.documents(user_id, content_hash);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_status ON public.ai_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_conv_user_scope ON public.ai_conversations(user_id, scope_type, scope_id);

-- 4. STORAGE BUCKET CONFIGURATION (Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('resora-documents', 'resora-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 5. ROW-LEVEL SECURITY & PERMISSION POLICIES
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Permissive policy for server API / authenticated application queries.
-- Data scoping is strictly verified and enforced in Next.js Server API route handlers
-- via getAuthenticatedUser() using Firebase token & session cookies.
DROP POLICY IF EXISTS "App profiles policy" ON public.profiles;
CREATE POLICY "App profiles policy" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "App resources policy" ON public.resources;
CREATE POLICY "App resources policy" ON public.resources FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "App tags policy" ON public.tags;
CREATE POLICY "App tags policy" ON public.tags FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "App use_cases policy" ON public.use_cases;
CREATE POLICY "App use_cases policy" ON public.use_cases FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "App collections policy" ON public.collections;
CREATE POLICY "App collections policy" ON public.collections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "App projects policy" ON public.projects;
CREATE POLICY "App projects policy" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "App documents policy" ON public.documents;
CREATE POLICY "App documents policy" ON public.documents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "App document_pages policy" ON public.document_pages;
CREATE POLICY "App document_pages policy" ON public.document_pages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "App ai_jobs policy" ON public.ai_jobs;
CREATE POLICY "App ai_jobs policy" ON public.ai_jobs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "App ai_conversations policy" ON public.ai_conversations;
CREATE POLICY "App ai_conversations policy" ON public.ai_conversations FOR ALL USING (true) WITH CHECK (true);
