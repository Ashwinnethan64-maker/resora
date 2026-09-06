-- ==========================================================
-- RESORA DATABASE SCHEMA — MIGRATION 20260906_documents.sql
-- ==========================================================

-- 1. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    page_count INTEGER NOT NULL DEFAULT 1,
    extraction_status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, unsupported
    extracted_text TEXT,
    content_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_documents_user_hash UNIQUE (user_id, content_hash),
    CONSTRAINT uq_documents_resource UNIQUE (resource_id)
);

CREATE INDEX IF NOT EXISTS idx_documents_resource_id ON public.documents(resource_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_extraction_status ON public.documents(extraction_status);
CREATE INDEX IF NOT EXISTS idx_documents_content_hash ON public.documents(content_hash);

-- 2. DOCUMENT PAGES TABLE (Page-aware indexing & citations)
CREATE TABLE IF NOT EXISTS public.document_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_doc_page UNIQUE (document_id, page_number)
);

CREATE INDEX IF NOT EXISTS idx_doc_pages_document_id ON public.document_pages(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_pages_page_number ON public.document_pages(page_number);

-- 3. STORAGE BUCKET CONFIGURATION (Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resora-documents', 'resora-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own document pages" ON public.document_pages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_pages.document_id AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own document pages" ON public.document_pages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_pages.document_id AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own document pages" ON public.document_pages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_pages.document_id AND d.user_id = auth.uid()
        )
    );

-- Storage bucket RLS policies
CREATE POLICY "Users can read own storage files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'resora-documents' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can upload own storage files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'resora-documents' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own storage files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'resora-documents' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
