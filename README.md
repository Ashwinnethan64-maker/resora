<div align="center">
  <img src="public/Resora_logo.png" alt="RESORA Logo" width="96" height="96" style="border-radius: 16px; margin-bottom: 12px;" />
  <h1>RESORA</h1>
  <p><strong>Personal Research Intelligence</strong></p>
  <p><em>Save it. Understand it. Use it.</em></p>

  <p>
    <a href="#quick-start">Quick Start</a> •
    <a href="#core-capabilities">Capabilities</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#security--data-privacy">Security</a> •
    <a href="#browser-extension">Browser Extension</a> •
    <a href="ARCHITECTURE.md">System Design</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.3.4-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-Ready-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
  </p>
</div>

---

## ⚡ What is RESORA?

Most builders, developers, researchers, founders, and students save high-value resources across dozens of disparate places: browser bookmarks, Twitter bookmarks, Slack messages, Notion tables, and downloaded PDFs. Over time, these become graveyard folders where information is saved but never found when actually needed.

**RESORA** solves this by turning scattered research into compound knowledge organized around what you are actively building.

It is **NOT** a generic bookmark manager, and it is **NOT** a generic ChatGPT wrapper. RESORA is a grounded personal intelligence platform that structures, cross-connects, and retrieves your saved research with exact provenance.

```
CAPTURE              INTELLIGENCE              ORGANIZATION              SYNTHESIS
[ Web / Extension ]       │                         │                         │
[ PDF / Text Docs ] ──▶ [ Metadata & Extraction ] ──▶ [ Projects & Stacks ] ──▶ [ Ask Resora (RAG) ]
[ Mobile Bookmark ]       │ (Anti-SSRF & Magic Byte) │ (Zero-Duplication)      │ (Exact Page Citations)
```

---

## 🚀 Core Capabilities

### 1. High-Velocity Capture & Ingestion
- **1-Click Web Capture**: Save articles, GitHub repos, technical documentation, tools, and social posts.
- **Manifest V3 Browser Extension**: Native extension popup for Chromium browsers and Firefox (`public/extension/`).
- **REST Quick Capture API**: Secure `/api/capture` endpoint for mobile shortcuts, CLI tools, and automation hooks.
- **Smart URL Normalization**: Automatically strips tracking parameters (`utm_*`, `fbclid`, `gclid`), detects source types, and checks for existing duplicates before indexing.

### 2. Document & File Intelligence
- **PDF & File Streaming Extraction**: Page-aware text extraction for PDF whitepapers, markdown docs, and text files.
- **Magic Byte Signature Verification**: Validates binary headers (`%PDF-` / `0x25 0x50 0x44 0x46 0x2D`) to prevent spoofed uploads.
- **SHA-256 Deduplication**: Prevents duplicate document storage through cryptographic content hashing.
- **In-Browser Document Reader**: Deep page-by-page reader modal with keyword highlighting and text search.

### 3. Project Workspaces & Recommendations
- **Contextual Workspaces**: Organize resources by build objectives (Hackathons, SaaS, Research, Freelance, Startups).
- **Zero-Duplication Data Model**: Resources are shared across projects without copying or fragmenting underlying records.
- **Explainable AI Recommendations**: Resora automatically matches relevant saved research to active project objectives with transparent scoring reasons.
- **Decision Logs & Architectural Notes**: Keep a persistent audit trail of technical decisions linked to specific resources.

### 4. Grounded AI Research Assistant ("Ask Resora")
- **Strict Library Grounding**: The assistant synthesizes answers exclusively from your saved resources and document pages.
- **Zero Hallucination Policy**: If your library does not contain relevant research, Resora clearly admits: *"I couldn't find enough information about that in your saved library."*
- **Multi-Scope Retrieval**: Ground queries across `Entire Library`, `Current Project`, `Current Collection`, `Documents Only`, `Developer Tools`, or `Favorites`.
- **Page-Level Interactive Citations**: Answers reference `[Source 1]`, `[Source 2]` with exact PDF page numbers that deep link directly into the Document Reader.
- **Deterministic Synthesis Fallback**: When an external AI provider API key is omitted, Resora generates structured comparison tables and grounded synthesis deterministically.

---

## 🔒 Security & Data Privacy

Resora was built from the ground up for privacy-conscious researchers:

- **SSRF Defense Firewall (`src/lib/security/ssrf.ts`)**:
  - Restricts protocols strictly to `http:` and `https:`.
  - Blocks loopback (`127.0.0.1`), private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), AWS/GCP cloud metadata (`169.254.169.254`), and internal suffixes (`.local`, `.internal`).
  - Follows redirects securely, verifying that redirected target destinations remain within safe public boundaries.
- **Upload Hardening**:
  - Strict 25MB ceiling and 300 page limits.
  - Rejects executable extensions (`.exe`, `.bat`, `.cmd`, `.sh`, `.php`, `.js`, `.py`, `.dll`).
- **Prompt Injection Defense**:
  - Retrieved library content is treated as untrusted data and strictly encapsulated inside `<library_context>` fences.
  - The assistant is structurally prohibited from performing autonomous destructive actions.
- **Data Portability & Account Deletion**:
  - Complete JSON and CSV data export in one click.
  - Browser bookmark HTML import with automatic duplicate skipping.
  - Permanent account deletion with cascading cleanup across resources, vectors, documents, and conversations.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16.3.4 (Turbopack)](https://nextjs.org/) | App Router, Server Components, Route Handlers |
| **Runtime & UI** | [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) | Strict typing, concurrent features, modern React |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Curated dark-first design system |
| **Icons & Typography** | [Lucide React](https://lucide.dev/), Inter, JetBrains Mono | Production icons and monospace accents |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + RLS) | Relational persistence, Row-Level Security, pgvector |
| **AI & Inference** | OpenAI API / Local Deterministic Engine | Semantic synthesis, structured taxonomy extraction |
| **Extension** | WebExtensions Manifest V3 | Cross-browser 1-click capture |

---

## 🏁 Quick Start

### 1. Prerequisites
- **Node.js**: v18.18.0 or newer (Node 20+ recommended)
- **npm** or **pnpm**

### 2. Installation
```bash
# Clone repository
git clone https://github.com/your-username/resora.git
cd resora

# Install dependencies
npm install
```

### 3. Environment Setup
Copy the environment template:
```bash
cp .env.example .env.local
```

Configure your `.env.local` settings:
```env
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Supabase (falls back to resilient local storage if omitted)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: OpenAI API Key (falls back to deterministic grounded synthesis if omitted)
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
AI_MODEL_NAME=gpt-4o-mini
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Production Build Verification
```bash
npm run build
npm run start
```

---

## 🧩 Browser Extension Setup

RESORA includes a ready-to-use Manifest V3 browser extension located in `public/extension/`:

1. Open **Chrome** or **Edge** and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** on (top right).
3. Click **Load unpacked** and select the `public/extension` folder.
4. The RESORA icon will appear in your browser toolbar. Clicking it allows 1-click capturing of any active webpage into your library!

---

## 📂 Project Structure

```
RESORA web/
├── public/
│   ├── Resora_logo.ico     # Official RESORA brand asset
│   ├── Resora_logo.png     # High-resolution PNG mark
│   ├── manifest.json       # PWA Web App Manifest
│   └── extension/          # Manifest V3 browser extension
│       ├── manifest.json
│       ├── popup.html
│       └── popup.js
├── src/
│   ├── app/
│   │   ├── api/            # Route handlers (AI, Assistant, Capture, Documents, Metadata)
│   │   ├── app/            # Authenticated workspace routes (Library, Projects, Assistant, etc.)
│   │   ├── auth/           # Authentication portal (Sign In, Sign Up, Reset)
│   │   ├── privacy/        # Privacy policy transparency
│   │   ├── terms/          # Terms of service
│   │   ├── layout.tsx      # Root layout, metadata icons, font definitions
│   │   ├── error.tsx       # Global React Error Boundary
│   │   └── not-found.tsx   # Branded 404 handler
│   ├── components/
│   │   ├── assistant/      # SourceCards, chat components
│   │   ├── brand/          # ResoraLogo component
│   │   ├── documents/      # PDF Dropzone, In-browser Document Reader
│   │   ├── layout/         # AppShell, Navigation Sidebar, Header
│   │   ├── onboarding/     # First-run onboarding modal
│   │   └── resources/      # Resource cards, save dialogs, filter bars
│   ├── context/            # ResoraContext (Reactive local & remote state)
│   ├── lib/
│   │   ├── assistant/      # Chunking service, hybrid retrieval, prompt fences
│   │   ├── auth/           # AuthService session manager
│   │   ├── documents/      # PDF streaming extractor, magic byte verifier
│   │   ├── security/       # SSRF firewall, input sanitizers
│   │   └── services/       # ResourceService CRUD & recommendation engine
│   └── types/              # Database models, RAG types, and schemas
└── supabase/
    └── migrations/         # PostgreSQL DDL, RLS policies, pgvector indexes
```

---

## 📖 Deep-Dive Documentation

- 📐 [Architecture & System Design](ARCHITECTURE.md)
- 📋 [Production Launch Checklist](PRODUCTION_CHECKLIST.md)
- 🗄️ [Database Migrations](supabase/migrations/)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
