-- ==========================================================
-- RESORA DATABASE SCHEMA — MIGRATION 20260906_init.sql
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    description TEXT,
    resource_type TEXT NOT NULL DEFAULT 'website',
    source_type TEXT NOT NULL DEFAULT 'web',
    thumbnail_url TEXT,
    favicon_url TEXT,
    content TEXT,
    personal_note TEXT,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_inbox BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_opened_at TIMESTAMPTZ
);

-- Optimize queries with indexes
CREATE INDEX IF NOT EXISTS idx_resources_user_id ON public.resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON public.resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON public.resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_is_favorite ON public.resources(is_favorite);
CREATE INDEX IF NOT EXISTS idx_resources_is_archived ON public.resources(is_archived);
CREATE INDEX IF NOT EXISTS idx_resources_domain ON public.resources(domain);
CREATE INDEX IF NOT EXISTS idx_resources_last_opened ON public.resources(last_opened_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_resources_user_url ON public.resources(user_id, url);

-- 2. TAGS TABLE
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_tags_user_name UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);

-- 3. RESOURCE_TAGS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.resource_tags (
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (resource_id, tag_id)
);

-- 4. USE_CASES TABLE ("Why would I use this?")
CREATE TABLE IF NOT EXISTS public.use_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_use_cases_user_name UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_use_cases_user_id ON public.use_cases(user_id);

-- 5. RESOURCE_USE_CASES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.resource_use_cases (
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    use_case_id UUID NOT NULL REFERENCES public.use_cases(id) ON DELETE CASCADE,
    PRIMARY KEY (resource_id, use_case_id)
);

-- 6. COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    topic TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);

-- 7. COLLECTION_RESOURCES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.collection_resources (
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (collection_id, resource_id)
);

-- 8. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    color TEXT NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);

-- 9. PROJECT_RESOURCES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.project_resources (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, resource_id)
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;

-- RESOURCES RLS
CREATE POLICY "Users can view own resources" ON public.resources
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resources" ON public.resources
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resources" ON public.resources
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resources" ON public.resources
    FOR DELETE USING (auth.uid() = user_id);

-- TAGS RLS
CREATE POLICY "Users can manage own tags" ON public.tags
    FOR ALL USING (auth.uid() = user_id);

-- RESOURCE_TAGS RLS
CREATE POLICY "Users can manage own resource tags" ON public.resource_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.resources r
            WHERE r.id = resource_tags.resource_id AND r.user_id = auth.uid()
        )
    );

-- USE_CASES RLS
CREATE POLICY "Users can manage own use cases" ON public.use_cases
    FOR ALL USING (auth.uid() = user_id);

-- RESOURCE_USE_CASES RLS
CREATE POLICY "Users can manage own resource use cases" ON public.resource_use_cases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.resources r
            WHERE r.id = resource_use_cases.resource_id AND r.user_id = auth.uid()
        )
    );

-- COLLECTIONS RLS
CREATE POLICY "Users can manage own collections" ON public.collections
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own collection resources" ON public.collection_resources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.collections c
            WHERE c.id = collection_resources.collection_id AND c.user_id = auth.uid()
        )
    );

-- PROJECTS RLS
CREATE POLICY "Users can manage own projects" ON public.projects
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own project resources" ON public.project_resources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_resources.project_id AND p.user_id = auth.uid()
        )
    );
