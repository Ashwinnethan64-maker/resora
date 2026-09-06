-- ==========================================================
-- RESORA DATABASE SCHEMA — MIGRATION 20260906_intelligence.sql
-- ==========================================================

-- 1. RESOURCE INTELLIGENCE TABLE
CREATE TABLE IF NOT EXISTS public.resource_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    summary TEXT,
    what_it_is TEXT,
    best_for TEXT[] DEFAULT '{}',
    key_points TEXT[] DEFAULT '{}',
    topics TEXT[] DEFAULT '{}',
    suggested_tags TEXT[] DEFAULT '{}',
    suggested_use_cases TEXT[] DEFAULT '{}',
    confidence TEXT NOT NULL DEFAULT 'medium', -- high, medium, low
    model TEXT NOT NULL DEFAULT 'resora-intelligence-v1',
    error_message TEXT,
    content_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_intelligence_resource UNIQUE (resource_id)
);

CREATE INDEX IF NOT EXISTS idx_intelligence_resource_id ON public.resource_intelligence(resource_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_user_id ON public.resource_intelligence(user_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_status ON public.resource_intelligence(status);

-- 2. RESOURCE INTELLIGENCE VERSIONS (Audit/History table)
CREATE TABLE IF NOT EXISTS public.resource_intelligence_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    analysis JSONB NOT NULL,
    model TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intelligence_versions_res ON public.resource_intelligence_versions(resource_id);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================================

ALTER TABLE public.resource_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_intelligence_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resource intelligence" ON public.resource_intelligence
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resource intelligence" ON public.resource_intelligence
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resource intelligence" ON public.resource_intelligence
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resource intelligence" ON public.resource_intelligence
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own intelligence versions" ON public.resource_intelligence_versions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intelligence versions" ON public.resource_intelligence_versions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
