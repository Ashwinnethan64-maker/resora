-- ==========================================================
-- RESORA PHASE 5: PROJECT WORKSPACES & INTELLIGENCE MIGRATION
-- ==========================================================

-- 1. Project Status & Types
DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('planning', 'active', 'paused', 'completed', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_type AS ENUM (
    'hackathon',
    'software_project',
    'research',
    'startup',
    'freelance',
    'learning',
    'personal',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_resource_status AS ENUM ('saved', 'reviewing', 'useful', 'used', 'reference');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Extend Projects Table
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS objective TEXT,
  ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'software_project',
  ADD COLUMN IF NOT EXISTS status_v2 TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS technologies TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS constraints TEXT,
  ADD COLUMN IF NOT EXISTS target_users TEXT,
  ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS template_id TEXT,
  ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Project Resources Junction Table (Strict Reference, Zero Duplication)
CREATE TABLE IF NOT EXISTS public.project_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'saved',
  is_important BOOLEAN DEFAULT false,
  group_name TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(project_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_project_resources_project_id ON public.project_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_project_resources_resource_id ON public.project_resources(resource_id);

-- 4. Project Notes Table (Lightweight markdown/text notes)
CREATE TABLE IF NOT EXISTS public.project_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON public.project_notes(project_id);

-- 5. Project Decisions Log (Architecture and Tech Decisions)
CREATE TABLE IF NOT EXISTS public.project_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision TEXT NOT NULL,
  reason TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_decisions_project_id ON public.project_decisions(project_id);

-- 6. Recommendation Dismissals (Never re-recommend dismissed resources immediately)
CREATE TABLE IF NOT EXISTS public.project_recommendation_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_project_dismissals_project_id ON public.project_recommendation_dismissals(project_id);

-- ==========================================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================================

ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_recommendation_dismissals ENABLE ROW LEVEL SECURITY;

-- Project Resources RLS: only project owner can manage
CREATE POLICY "Users can manage project resources for their projects"
ON public.project_resources
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_resources.project_id AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_resources.project_id AND p.user_id = auth.uid()
  )
);

-- Project Notes RLS: user owns notes
CREATE POLICY "Users can manage their project notes"
ON public.project_notes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Project Decisions RLS: user owns decisions
CREATE POLICY "Users can manage their project decisions"
ON public.project_decisions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Dismissals RLS
CREATE POLICY "Users can manage their recommendation dismissals"
ON public.project_recommendation_dismissals
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_recommendation_dismissals.project_id AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_recommendation_dismissals.project_id AND p.user_id = auth.uid()
  )
);
