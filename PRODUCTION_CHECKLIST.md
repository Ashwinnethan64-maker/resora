# RESORA Production Launch Checklist

This checklist tracks verified production capabilities and remaining external configurations.

---

## 1. Verified & Implemented Features

### Security & Ingress Protections
- [x] **SSRF Defense Firewall**: Verified blocking loopback (`127.0.0.1`), private IP subnets (`10.x`, `172.16-31.x`, `192.168.x`), cloud metadata (`169.254.169.254`), and non-HTTP(S) schemes.
- [x] **File Upload Hardening**: Verified 25MB file ceiling, executable extension rejection, binary magic byte checks (`%PDF-`), and SHA-256 deduplication.
- [x] **HTTP Security Headers**: Configured HSTS, Frameguard, nosniff, and Referrer-Policy in `next.config.ts`.
- [x] **Prompt Injection Protections**: System instructions explicitly separate instructions from untrusted library context.
- [x] **Destructive Action Confirmation**: Cascade account deletion requires typing `DELETE` to execute.

### Application & User Flow
- [x] **Authentication Engine**: Sign In, Sign Up, and Password Reset screens at `/auth` with session cookie generation for middleware.
- [x] **Route Protection**: Edge middleware guarding `/app/*` routes.
- [x] **Onboarding**: 3-step lightweight onboarding modal for interest selection and first resource capture.
- [x] **Data Portability**: Full JSON and CSV export of resources, projects, and metadata.
- [x] **Bookmark Import**: Browser bookmark HTML parser with duplicate URL skipping.
- [x] **Quick Capture API**: `/api/capture` endpoint for extensions and mobile webhooks.
- [x] **Browser Extension**: Manifest V3 extension ready for Chrome, Edge, and Firefox.
- [x] **PWA & Offline Awareness**: `manifest.json` configured and real-time offline status banner.
- [x] **Error Boundaries & 404**: Custom branded 404 page and global React error boundary.

---

## 2. External Production Configurations Required

Before exposing RESORA to public traffic, complete these external infrastructure steps:

1. **Supabase Production Project**:
   - Create production Supabase instance.
   - Run SQL migrations in sequential order from `supabase/migrations/`.
   - Configure Auth Providers (Email Confirmation, Google/GitHub OAuth if desired).
   - Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

2. **AI Provider API Key**:
   - Set `OPENAI_API_KEY` (or compatible endpoint via `OPENAI_BASE_URL`).
   - Set `AI_MODEL_NAME` (e.g., `gpt-4o-mini` or `gpt-4o`).

3. **Domain & DNS**:
   - Connect custom domain (e.g. `resora.app`) in Vercel / hosting provider.
   - Verify SSL/TLS certificates and DNS propagation.
