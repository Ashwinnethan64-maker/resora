-- ==========================================================
-- RESORA — GLOBAL DUPLICATE PREVENTION & STRICT UNIQUENESS
-- Migration: 20260907_duplicate_prevention.sql
-- ==========================================================

-- 1. Ensure normalized_url and original_url columns exist on resources
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS original_url TEXT,
  ADD COLUMN IF NOT EXISTS normalized_url TEXT,
  ADD COLUMN IF NOT EXISTS source_document_id TEXT;

-- Backfill normalized_url from url if empty
UPDATE public.resources
SET normalized_url = lower(trim(trailing '/' from regexp_replace(url, '[\?#].*$', '')))
WHERE normalized_url IS NULL OR normalized_url = '';

-- Backfill original_url from url if empty
UPDATE public.resources
SET original_url = url
WHERE original_url IS NULL OR original_url = '';

-- 2. Clean existing duplicate resources safely:
-- Identify duplicate groups by (user_id, normalized_url), keep canonical record (earliest created or favorited),
-- merge tags, notes, collections, projects, and delete duplicate surplus records.
DO 
DECLARE
    dup_record RECORD;
    canonical_id UUID;
    surplus_id UUID;
BEGIN
    FOR dup_record IN
        SELECT user_id, normalized_url, count(*) as cnt
        FROM public.resources
        WHERE normalized_url IS NOT NULL AND normalized_url != ''
        GROUP BY user_id, normalized_url
        HAVING count(*) > 1
    LOOP
        -- Pick the best record (favorited first, else earliest created)
        SELECT id INTO canonical_id
        FROM public.resources
        WHERE user_id = dup_record.user_id AND normalized_url = dup_record.normalized_url
        ORDER BY is_favorite DESC, created_at ASC
        LIMIT 1;

        -- Iterate surplus duplicates and merge relationships
        FOR surplus_id IN
            SELECT id
            FROM public.resources
            WHERE user_id = dup_record.user_id AND normalized_url = dup_record.normalized_url AND id != canonical_id
        LOOP
            -- Preserve personal notes if canonical is blank
            UPDATE public.resources c
            SET personal_note = s.personal_note
            FROM public.resources s
            WHERE c.id = canonical_id AND s.id = surplus_id
              AND (c.personal_note IS NULL OR c.personal_note = '')
              AND (s.personal_note IS NOT NULL AND s.personal_note != '');

            -- Re-link resource_tags to canonical
            INSERT INTO public.resource_tags (resource_id, tag_id)
            SELECT canonical_id, tag_id
            FROM public.resource_tags
            WHERE resource_id = surplus_id
            ON CONFLICT DO NOTHING;

            -- Re-link resource_use_cases to canonical
            INSERT INTO public.resource_use_cases (resource_id, use_case_id)
            SELECT canonical_id, use_case_id
            FROM public.resource_use_cases
            WHERE resource_id = surplus_id
            ON CONFLICT DO NOTHING;

            -- Delete surplus duplicate
            DELETE FROM public.resources WHERE id = surplus_id;
        END LOOP;
    END LOOP;
END ;

-- 3. Enforce Strict Unique Constraint on (user_id, normalized_url)
ALTER TABLE public.resources
  DROP CONSTRAINT IF EXISTS uq_resources_user_normalized_url;

ALTER TABLE public.resources
  ADD CONSTRAINT uq_resources_user_normalized_url UNIQUE (user_id, normalized_url);

-- 4. Enforce Strict Unique Constraint on (user_id, content_hash) for documents
DO 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
        ALTER TABLE public.documents
          DROP CONSTRAINT IF EXISTS uq_documents_user_content_hash;

        ALTER TABLE public.documents
          ADD CONSTRAINT uq_documents_user_content_hash UNIQUE (user_id, content_hash);
    END IF;
END ;

-- 5. Relationship Junction Uniqueness
DO 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'resource_tags') THEN
        ALTER TABLE public.resource_tags
          DROP CONSTRAINT IF EXISTS uq_resource_tags;
        ALTER TABLE public.resource_tags
          ADD CONSTRAINT uq_resource_tags UNIQUE (resource_id, tag_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'resource_use_cases') THEN
        ALTER TABLE public.resource_use_cases
          DROP CONSTRAINT IF EXISTS uq_resource_use_cases;
        ALTER TABLE public.resource_use_cases
          ADD CONSTRAINT uq_resource_use_cases UNIQUE (resource_id, use_case_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_resources') THEN
        ALTER TABLE public.project_resources
          DROP CONSTRAINT IF EXISTS uq_project_resources;
        ALTER TABLE public.project_resources
          ADD CONSTRAINT uq_project_resources UNIQUE (project_id, resource_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'collection_resources') THEN
        ALTER TABLE public.collection_resources
          DROP CONSTRAINT IF EXISTS uq_collection_resources;
        ALTER TABLE public.collection_resources
          ADD CONSTRAINT uq_collection_resources UNIQUE (collection_id, resource_id);
    END IF;
END ;
