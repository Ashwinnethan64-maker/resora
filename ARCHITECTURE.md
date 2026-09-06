# RESORA Architecture Documentation

## 1. System Overview
**RESORA** is a personal research intelligence SaaS designed for builders, developers, founders, and researchers to capture websites, tools, PDFs, and repositories, automatically extract structured semantics, organize knowledge around active projects, and retrieve grounded answers via an AI research assistant with citation provenance.

```
CAPTURE              INTELLIGENCE              ORGANIZATION              SYNTHESIS
[ Web / Extension ]       │                         │                         │
[ PDF / Text Docs ] ──▶ [ Metadata & Extraction ] ──▶ [ Projects & Stacks ] ──▶ [ Ask Resora (RAG) ]
[ Mobile Bookmark ]       │ (Anti-SSRF & Magic Byte) │ (Zero-Duplication)      │ (Exact Page Citations)
```

---

## 2. Core Architecture & Layers

### 2.1 Security & Ingress Protections
- **SSRF Defense Engine (`src/lib/security/ssrf.ts`)**:
  - Outgoing fetch requests are strictly audited.
  - Blocks loopback (`127.0.0.1`), RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), AWS/GCP metadata endpoints (`169.254.169.254`), and internal domain suffixes (`.local`, `.internal`, `.localhost`).
  - Strict protocol whitelisting: only `http:` and `https:`. Unsafe protocols (`file:`, `ftp:`, `javascript:`, `data:`) are rejected.
  - Redirect-following SSRF inspection ensures redirected targets cannot bounce to internal addresses.
- **File Upload Security (`src/lib/documents/document-extractor.ts`)**:
  - Enforces 25MB file size limit and 300 page ceilings.
  - Verifies binary magic byte signatures (`%PDF-` / `0x25 0x50 0x44 0x46 0x2D`).
  - Prohibits executable script extensions (`.exe`, `.sh`, `.bat`, `.py`, `.js`, etc.).
  - Generates SHA-256 content hashes for byte-level duplicate detection.
- **Production HTTP Headers (`next.config.ts`)**:
  - `Strict-Transport-Security`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: origin-when-cross-origin`, and `Permissions-Policy`.

### 2.2 Ingestion & Resource Engine
- **Normalizer (`src/lib/url-helper.ts`)**:
  - Strips tracking tokens (`utm_*`, `fbclid`, `gclid`).
  - Categorizes resources into typed taxonomy (`ai_tool`, `developer_tool`, `github`, `video`, `social_post`, `pdf`, `document`, `article`).
- **Quick Capture API (`src/app/api/capture/route.ts`)**:
  - REST endpoint for browser extensions, mobile share sheets, and CLI hooks.
- **Browser Extension MVP (`public/extension/`)**:
  - Manifest V3 extension providing 1-click capture from Chrome, Edge, and Firefox.

### 2.3 Document & File Extraction Pipeline
- In-memory PDF streaming parser extracts text and preserves page boundaries (`page_number`).
- Text files and Markdown are indexed with chunk size normalization.
- Embedded Document Reader (`DocumentViewerModal.tsx`) provides page-by-page navigation and text search.

### 2.4 Project Workspaces & Recommendations
- Projects define active objectives, target frameworks, and constraints.
- Zero-duplication relationship architecture allows resources to be referenced across multiple projects without duplicating records.
- Explainable recommendation engine surfaces saved resources relevant to project objectives with transparent scoring reasons.

### 2.5 Grounded AI Research Assistant ("Ask Resora")
- **Prompt Isolation**: System instructions are strictly defended against prompt injection. Retrieved library snippets are fenced as untrusted data inside `<library_context>` blocks.
- **No Hallucination Fallback**: If query context does not exist in the library, Resora clearly refuses to fabricate information.
- **Multi-Scope Grounding**: Users can scope retrieval to `Entire Library`, `Current Project`, `Current Collection`, `Documents Only`, `Developer Tools`, or `Favorites`.
- **Structured Citations**: Answers reference `[Source 1]`, `[Source 2]` with exact page numbers for PDF documents that deep link directly to the Document Viewer.

---

## 3. Database & Storage Architecture
- Supabase PostgreSQL schema with Row-Level Security (RLS) policies on all tables.
- Full text search indexes and `pgvector` vector embedding tables (`resource_chunks`, `document_chunks`).
- Cascade deletions ensure account and project cleanups leave no orphaned records or vectors.
