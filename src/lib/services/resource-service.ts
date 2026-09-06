import {
  ResourceModel,
  ResourceIntelligence,
  DocumentModel,
  DocumentPageModel,
  TagModel,
  UseCaseModel,
  CollectionModel,
  ProjectModel,
  ProjectNoteModel,
  ProjectDecisionModel,
  ResourceFilterOptions,
} from '@/types/database';
import { INITIAL_SUGGESTED_TAGS, INITIAL_SUGGESTED_USE_CASES } from '@/lib/resource-types';

const STORAGE_KEYS = {
  RESOURCES: 'resora_resources_v2',
  INTELLIGENCE: 'resora_intelligence_v2',
  DOCUMENTS: 'resora_documents_v2',
  DOCUMENT_PAGES: 'resora_document_pages_v2',
  TAGS: 'resora_tags_v2',
  USE_CASES: 'resora_use_cases_v2',
  COLLECTIONS: 'resora_collections_v2',
  PROJECTS: 'resora_projects_v2',
  PROJECT_RESOURCES: 'resora_project_resources_v2',
  PROJECT_NOTES: 'resora_project_notes_v2',
  PROJECT_DECISIONS: 'resora_project_decisions_v2',
  PROJECT_DISMISSALS: 'resora_project_dismissals_v2',
};

// Seed resources
const SEED_RESOURCES: ResourceModel[] = [
  {
    id: 'res-1',
    user_id: 'usr_local',
    title: 'Kilo AI',
    url: 'https://kilo.ai',
    domain: 'kilo.ai',
    description: 'AI coding assistant built for rapid software development, autonomous code edits, and real-time pair programming.',
    resource_type: 'ai_tool',
    source_type: 'web',
    favicon_url: 'https://www.google.com/s2/favicons?domain=kilo.ai&sz=64',
    personal_note: 'Useful for experimenting with agentic coding workflows in hackathon environments.',
    is_favorite: true,
    is_archived: false,
    is_inbox: false,
    created_at: '2026-09-04T10:00:00.000Z',
    updated_at: '2026-09-04T10:00:00.000Z',
    tags: ['AI', 'Coding', 'Developer Tools', 'Hackathon'],
    use_cases: ['Build', 'Hackathon', 'Code'],
  },
  {
    id: 'res-2',
    user_id: 'usr_local',
    title: 'Cline',
    url: 'https://github.com/cline/cline',
    domain: 'github.com',
    description: 'Autonomous coding agent in your IDE capable of creating, editing, and running shell commands directly.',
    resource_type: 'developer_tool',
    source_type: 'web',
    favicon_url: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
    personal_note: 'Examines human-in-the-loop permission approvals for file writes and shell execution.',
    is_favorite: true,
    is_archived: false,
    is_inbox: false,
    created_at: '2026-09-03T15:30:00.000Z',
    updated_at: '2026-09-03T15:30:00.000Z',
    tags: ['Coding', 'Automation', 'AI'],
    use_cases: ['Code', 'Automate'],
  },
  {
    id: 'res-3',
    user_id: 'usr_local',
    title: 'Ninite',
    url: 'https://ninite.com',
    domain: 'ninite.com',
    description: 'Install and update all your programs at once without toolbars or clicking Next.',
    resource_type: 'developer_tool',
    source_type: 'web',
    favicon_url: 'https://www.google.com/s2/favicons?domain=ninite.com&sz=64',
    personal_note: 'Gold standard for bootstrapping fresh Windows developer VMs.',
    is_favorite: false,
    is_archived: false,
    is_inbox: false,
    created_at: '2026-09-02T08:15:00.000Z',
    updated_at: '2026-09-02T08:15:00.000Z',
    tags: ['Productivity', 'DevOps'],
    use_cases: ['Deploy'],
  },
  {
    id: 'res-4',
    user_id: 'usr_local',
    title: 'Moda Design System',
    url: 'https://moda.design',
    domain: 'moda.design',
    description: 'Minimalist creative workspace and productivity canvas for design teams and digital creators.',
    resource_type: 'web_app',
    source_type: 'web',
    favicon_url: 'https://www.google.com/s2/favicons?domain=moda.design&sz=64',
    personal_note: 'Clean typography tokens and subtle micro-interaction inspirations.',
    is_favorite: true,
    is_archived: false,
    is_inbox: false,
    created_at: '2026-09-01T12:00:00.000Z',
    updated_at: '2026-09-01T12:00:00.000Z',
    tags: ['Design', 'Frontend', 'UI'],
    use_cases: ['Design', 'Build'],
  },
  {
    id: 'res-5',
    user_id: 'usr_local',
    title: 'AI Agents Research.pdf',
    url: '/documents/AI_Agents_Research.pdf',
    domain: 'documents.local',
    description: 'A comprehensive research study on compound AI systems, memory architectures, and stateful agent coordination.',
    resource_type: 'pdf',
    source_type: 'upload',
    favicon_url: 'https://www.google.com/s2/favicons?domain=arxiv.org&sz=64',
    personal_note: 'Section 4 details long-term memory retrieval using sparse vector hybrid indexes.',
    is_favorite: false,
    is_archived: false,
    is_inbox: false,
    created_at: '2026-08-30T16:45:00.000Z',
    updated_at: '2026-08-30T16:45:00.000Z',
    tags: ['Research', 'AI', 'Agents'],
    use_cases: ['Research', 'Learn'],
    file_name: 'AI_Agents_Research.pdf',
    file_size: 4800000,
    page_count: 38,
    mime_type: 'application/pdf',
    storage_path: 'documents/usr_local/res-5/AI_Agents_Research.pdf',
    extraction_status: 'completed',
  },
  {
    id: 'res-6',
    user_id: 'usr_local',
    title: 'Claude Cowork Guide',
    url: 'https://anthropic.com/guides/cowork',
    domain: 'anthropic.com',
    description: 'Official best practices for human-agent pair programming, contextual prompting, and artifact iteration.',
    resource_type: 'tutorial',
    source_type: 'web',
    favicon_url: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=64',
    personal_note: 'Essential guidelines on test-driven agentic loops and planning protocols.',
    is_favorite: true,
    is_archived: false,
    is_inbox: false,
    created_at: '2026-08-29T11:20:00.000Z',
    updated_at: '2026-08-29T11:20:00.000Z',
    tags: ['Tutorial', 'Learning', 'AI'],
    use_cases: ['Learn', 'Code'],
  },
  {
    id: 'res-doc-2',
    user_id: 'usr_local',
    title: 'Hackathon Guidelines 2026.pdf',
    url: '/documents/Hackathon_Guidelines_2026.pdf',
    domain: 'documents.local',
    description: 'Judging rubric, API sponsor keys, presentation constraints, and submission deadlines.',
    resource_type: 'pdf',
    source_type: 'upload',
    favicon_url: 'https://www.google.com/s2/favicons?domain=documents.local&sz=64',
    personal_note: 'Review slide deck requirements 3 hours before deadline.',
    is_favorite: true,
    is_archived: false,
    is_inbox: false,
    created_at: '2026-08-28T14:00:00.000Z',
    updated_at: '2026-08-28T14:00:00.000Z',
    tags: ['Hackathon', 'Guidelines'],
    use_cases: ['Hackathon', 'Present'],
    file_name: 'Hackathon_Guidelines_2026.pdf',
    file_size: 1250000,
    page_count: 12,
    mime_type: 'application/pdf',
    storage_path: 'documents/usr_local/res-doc-2/Hackathon_Guidelines_2026.pdf',
    extraction_status: 'completed',
  },
  {
    id: 'res-inbox-1',
    user_id: 'usr_local',
    title: 'LangGraph Multi-Agent Orchestration',
    url: 'https://github.com/langchain-ai/langgraph',
    domain: 'github.com',
    description: 'Graph-based framework for cyclic and resilient multi-agent collaboration in complex code tasks.',
    resource_type: 'github',
    source_type: 'web',
    favicon_url: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
    personal_note: '',
    is_favorite: false,
    is_archived: false,
    is_inbox: true,
    created_at: '2026-09-06T12:00:00.000Z',
    updated_at: '2026-09-06T12:00:00.000Z',
    tags: ['AI', 'Backend'],
    use_cases: ['Build', 'Automate'],
  },
];

const SEED_INTELLIGENCE: Record<string, ResourceIntelligence> = {
  'res-1': {
    id: 'intel-1',
    resource_id: 'res-1',
    user_id: 'usr_local',
    status: 'completed',
    summary: 'An AI-powered coding assistant designed to help developers write, modify, and explore software repositories with agentic workflows.',
    what_it_is: 'A developer-focused AI coding tool designed to assist with real-time software development workflows and terminal commands.',
    best_for: [
      'AI-assisted development',
      'Rapid prototyping',
      'Hackathons',
      'Codebase exploration',
    ],
    key_points: [
      'Autonomous coding agent inside modern developer workflows',
      'Real-time pair programming and code refactoring',
      'Terminal execution and file editing capabilities',
      'Optimized for rapid prototype sprints',
    ],
    topics: ['AI', 'Coding', 'Developer Tools'],
    suggested_tags: ['AI', 'Coding', 'Agents', 'DeveloperTools'],
    suggested_use_cases: ['Build', 'Code', 'Hackathon'],
    confidence: 'high',
    model: 'resora-intelligence-v1',
    created_at: '2026-09-04T10:05:00.000Z',
    updated_at: '2026-09-04T10:05:00.000Z',
  },
  'res-5': {
    id: 'intel-5',
    resource_id: 'res-5',
    user_id: 'usr_local',
    status: 'completed',
    summary: 'A formal research paper detailing compound AI system design, long-term memory retrieval, and agent reflection architectures.',
    what_it_is: 'An academic whitepaper on distributed stateful coordination for autonomous reasoning agents.',
    best_for: [
      'Academic citation',
      'System design reference',
      'Memory architecture research',
    ],
    key_points: [
      'Sparse vector hybrid indexing evaluation (Page 4)',
      'Stateful reflection buffers and error recovery (Page 9)',
      'Comprehensive benchmark topologies across agentic models (Page 14)',
    ],
    topics: ['Research', 'AI', 'Architecture'],
    suggested_tags: ['Paper', 'Architecture', 'Agents'],
    suggested_use_cases: ['Research', 'Learn'],
    confidence: 'high',
    model: 'resora-intelligence-v1',
    created_at: '2026-08-30T16:50:00.000Z',
    updated_at: '2026-08-30T16:50:00.000Z',
  },
};

const SEED_DOCUMENTS: Record<string, DocumentModel> = {
  'res-5': {
    id: 'doc-res-5',
    resource_id: 'res-5',
    user_id: 'usr_local',
    file_name: 'AI_Agents_Research.pdf',
    file_size: 4800000,
    mime_type: 'application/pdf',
    storage_path: 'documents/usr_local/res-5/AI_Agents_Research.pdf',
    page_count: 38,
    extraction_status: 'completed',
    extracted_text: 'Taxonomy of autonomous reasoning agents, planning topologies, and reflective memory buffers.',
    content_hash: 'sha256_seed_doc_1',
    created_at: '2026-08-30T16:45:00.000Z',
    updated_at: '2026-08-30T16:45:00.000Z',
  },
  'res-doc-2': {
    id: 'doc-res-doc-2',
    resource_id: 'res-doc-2',
    user_id: 'usr_local',
    file_name: 'Hackathon_Guidelines_2026.pdf',
    file_size: 1250000,
    mime_type: 'application/pdf',
    storage_path: 'documents/usr_local/res-doc-2/Hackathon_Guidelines_2026.pdf',
    page_count: 12,
    extraction_status: 'completed',
    extracted_text: 'Judging rubric, API sponsor keys, presentation constraints, and submission deadlines.',
    content_hash: 'sha256_seed_doc_2',
    created_at: '2026-08-28T14:00:00.000Z',
    updated_at: '2026-08-28T14:00:00.000Z',
  },
};

const SEED_PROJECTS: ProjectModel[] = [
  {
    id: 'proj-1',
    user_id: 'usr_local',
    name: 'Hackathon 2026',
    description: 'Autonomous research intelligence assistant prototype for the upcoming global AI hackathon.',
    objective: 'Build an autonomous agentic research copilot that indexes developer libraries and presents page-level insights.',
    status: 'active',
    project_type: 'hackathon',
    template_id: 'hackathon',
    color: '#6366f1',
    technologies: ['Next.js', 'TypeScript', 'Supabase', 'TailwindCSS', 'NVIDIA Nemotron API'],
    constraints: 'Must complete and present 2-minute demo within the 48-hour sprint window.',
    target_users: 'Hackathon builders, indie developers, and autonomous agent researchers.',
    keywords: ['Agent', 'Research', 'Hackathon', 'Vector', 'Supabase'],
    groups: [
      'Problem Research',
      'Existing Solutions',
      'Technology & APIs',
      'UI & Design Inspiration',
      'Implementation',
      'Pitch & Presentation',
    ],
    created_at: '2026-08-25T10:00:00.000Z',
    updated_at: '2026-09-06T10:00:00.000Z',
    last_opened_at: '2026-09-06T12:00:00.000Z',
    resource_ids: ['res-1', 'res-2', 'res-5', 'res-doc-2'],
  },
  {
    id: 'proj-2',
    user_id: 'usr_local',
    name: 'AI SaaS Prototype',
    description: 'Production architecture, database schema, payment gateways, and design system tokens.',
    objective: 'Ship a production-ready AI SaaS boilerplate with robust multi-tenant RLS and automated billing.',
    status: 'active',
    project_type: 'software_project',
    template_id: 'software_project',
    color: '#06b6d4',
    technologies: ['React', 'Next.js', 'PostgreSQL', 'Prisma', 'Stripe'],
    constraints: 'Multi-tenant data isolation must be enforced at database engine level via RLS.',
    target_users: 'B2B SaaS builders and early-stage founders.',
    keywords: ['SaaS', 'PostgreSQL', 'RLS', 'Stripe', 'Architecture'],
    groups: [
      'System Architecture',
      'Database Schema',
      'Authentication & Security',
      'Frontend & UI System',
      'Integrations & Webhooks',
      'Deployment & Monitoring',
    ],
    created_at: '2026-08-20T10:00:00.000Z',
    updated_at: '2026-09-05T14:00:00.000Z',
    last_opened_at: '2026-09-05T15:30:00.000Z',
    resource_ids: ['res-4'],
  },
];

const SEED_PROJECT_NOTES: Record<string, ProjectNoteModel[]> = {
  'proj-1': [
    {
      id: 'note-1',
      project_id: 'proj-1',
      user_id: 'usr_local',
      title: 'Architecture Review: Compound Agent Loops',
      content: 'Read Section 4 of the AI Agents PDF. We should utilize stateful reflection buffers rather than single-turn tool calls to avoid loop divergence.',
      created_at: '2026-09-01T14:00:00.000Z',
      updated_at: '2026-09-01T14:00:00.000Z',
    },
    {
      id: 'note-2',
      project_id: 'proj-1',
      user_id: 'usr_local',
      title: 'UI Component Selection',
      content: 'Use Magic UI and TailwindCSS for clean, dark-mode terminal cards and fast first-glance demo impression.',
      created_at: '2026-09-03T11:20:00.000Z',
      updated_at: '2026-09-03T11:20:00.000Z',
    },
  ],
  'proj-2': [
    {
      id: 'note-3',
      project_id: 'proj-2',
      user_id: 'usr_local',
      title: 'Database Multi-Tenancy Strategy',
      content: 'Evaluate Row Level Security vs schema-per-tenant. Native PostgreSQL RLS with Supabase auth UID claims is the cleanest for our scope.',
      created_at: '2026-08-22T09:15:00.000Z',
      updated_at: '2026-08-22T09:15:00.000Z',
    },
  ],
};

const SEED_PROJECT_DECISIONS: Record<string, ProjectDecisionModel[]> = {
  'proj-1': [
    {
      id: 'dec-1',
      project_id: 'proj-1',
      user_id: 'usr_local',
      decision: 'Use Supabase instead of Firebase',
      reason: 'First-class PostgreSQL compatibility, strict relational schema constraints, and instant pgvector support.',
      date: '2026-08-26',
      created_at: '2026-08-26T12:00:00.000Z',
    },
    {
      id: 'dec-2',
      project_id: 'proj-1',
      user_id: 'usr_local',
      decision: 'Adopt Next.js Turbopack for local development',
      reason: 'Sub-second cold boot times and fast HMR crucial during live hackathon demos.',
      date: '2026-08-27',
      created_at: '2026-08-27T16:30:00.000Z',
    },
  ],
};

const SEED_COLLECTIONS: CollectionModel[] = [
  {
    id: 'col-1',
    user_id: 'usr_local',
    name: 'Hackathon Toolkit',
    description: 'High-speed boilerplate, instant databases, deployment templates, and vector API endpoints.',
    topic: 'Hackathons & Rapid Prototyping',
    created_at: '2026-08-28T10:00:00.000Z',
    updated_at: '2026-09-06T11:00:00.000Z',
    resource_ids: ['res-1', 'res-2', 'res-doc-2'],
  },
  {
    id: 'col-2',
    user_id: 'usr_local',
    name: 'AI Development Stack',
    description: 'Core toolchain including model gateways, agent orchestrators, eval runners, and vector databases.',
    topic: 'AI & LLM Engineering',
    created_at: '2026-08-25T10:00:00.000Z',
    updated_at: '2026-09-05T12:00:00.000Z',
    resource_ids: ['res-1', 'res-2', 'res-5'],
  },
];

// In-memory store fallback for server-side environments (Node.js/Next.js Route Handlers)
const SERVER_CACHE: Record<string, any> = {};

function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    if (SERVER_CACHE[key] !== undefined) return SERVER_CACHE[key];
    return fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    SERVER_CACHE[key] = value;
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} in localStorage:`, e);
  }
}

export class ResourceService {
  static initStore() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.RESOURCES)) {
      setLocalItem(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INTELLIGENCE)) {
      setLocalItem(STORAGE_KEYS.INTELLIGENCE, SEED_INTELLIGENCE);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
      setLocalItem(STORAGE_KEYS.DOCUMENTS, SEED_DOCUMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      setLocalItem(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COLLECTIONS)) {
      setLocalItem(STORAGE_KEYS.COLLECTIONS, SEED_COLLECTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TAGS)) {
      const tags: TagModel[] = INITIAL_SUGGESTED_TAGS.map((name, i) => ({
        id: `tag-${i}`,
        user_id: 'usr_local',
        name,
        created_at: new Date().toISOString(),
      }));
      setLocalItem(STORAGE_KEYS.TAGS, tags);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USE_CASES)) {
      const ucs: UseCaseModel[] = INITIAL_SUGGESTED_USE_CASES.map((name, i) => ({
        id: `uc-${i}`,
        user_id: 'usr_local',
        name,
        created_at: new Date().toISOString(),
      }));
      setLocalItem(STORAGE_KEYS.USE_CASES, ucs);
    }
  }

  static async checkDuplicate(url: string): Promise<ResourceModel | null> {
    const cleanTarget = url.trim().toLowerCase();
    const resources = await this.getAllResources();
    return (
      resources.find(
        (r) => !r.is_archived && r.url.trim().toLowerCase() === cleanTarget
      ) || null
    );
  }

  static async getAllResources(): Promise<ResourceModel[]> {
    this.initStore();
    return getLocalItem<ResourceModel[]>(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
  }

  static async queryResources(options: ResourceFilterOptions = {}): Promise<ResourceModel[]> {
    let list = await this.getAllResources();

    if (options.isArchived !== undefined) {
      list = list.filter((r) => r.is_archived === options.isArchived);
    } else {
      list = list.filter((r) => !r.is_archived);
    }

    if (options.isInbox !== undefined) {
      list = list.filter((r) => (r.is_inbox || false) === options.isInbox);
    }

    if (options.isFavorite !== undefined) {
      list = list.filter((r) => r.is_favorite === options.isFavorite);
    }

    if (options.resourceType && options.resourceType !== 'all') {
      list = list.filter((r) => r.resource_type === options.resourceType);
    }

    if (options.tag && options.tag !== 'all') {
      const cleanTag = options.tag.toLowerCase();
      list = list.filter((r) => r.tags?.some((t) => t.toLowerCase() === cleanTag));
    }

    if (options.useCase && options.useCase !== 'all') {
      const cleanUc = options.useCase.toLowerCase();
      list = list.filter((r) => r.use_cases?.some((u) => u.toLowerCase() === cleanUc));
    }

    if (options.query && options.query.trim()) {
      const q = options.query.trim().toLowerCase();
      list = list.filter((r) => {
        return (
          r.title.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          r.domain.toLowerCase().includes(q) ||
          (r.file_name && r.file_name.toLowerCase().includes(q)) ||
          r.tags?.some((t) => t.toLowerCase().includes(q)) ||
          r.use_cases?.some((u) => u.toLowerCase().includes(q)) ||
          (r.content && r.content.toLowerCase().includes(q))
        );
      });
    }

    const sort = options.sortBy || 'newest';
    list = [...list].sort((a, b) => {
      if (sort === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sort === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      if (sort === 'recently_opened') {
        const timeA = a.last_opened_at ? new Date(a.last_opened_at).getTime() : 0;
        const timeB = b.last_opened_at ? new Date(b.last_opened_at).getTime() : 0;
        return timeB - timeA;
      }
      if (sort === 'recently_updated') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }

  static async getResourceById(id: string): Promise<ResourceModel | null> {
    const list = await this.getAllResources();
    return list.find((r) => r.id === id) || null;
  }

  static async createResource(
    data: Omit<ResourceModel, 'id' | 'user_id' | 'created_at' | 'updated_at'> & {
      id?: string;
    }
  ): Promise<ResourceModel> {
    const all = await this.getAllResources();
    const newResource: ResourceModel = {
      id: data.id || `res-${Date.now()}`,
      user_id: 'usr_local',
      title: data.title,
      url: data.url,
      domain: data.domain,
      description: data.description || '',
      resource_type: data.resource_type,
      source_type: data.source_type,
      thumbnail_url: data.thumbnail_url,
      favicon_url: data.favicon_url || `https://www.google.com/s2/favicons?domain=${data.domain}&sz=64`,
      content: data.content || '',
      personal_note: data.personal_note || '',
      is_favorite: data.is_favorite || false,
      is_archived: data.is_archived || false,
      is_inbox: data.is_inbox !== undefined ? data.is_inbox : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: data.tags || [],
      use_cases: data.use_cases || [],
      tag_sources: {},
      use_case_sources: {},
      document_id: data.document_id,
      file_name: data.file_name,
      file_size: data.file_size,
      page_count: data.page_count,
      mime_type: data.mime_type,
    };

    const updated = [newResource, ...all];
    setLocalItem(STORAGE_KEYS.RESOURCES, updated);

    // Trigger asynchronous AI analysis for web/doc resource
    if (typeof window !== 'undefined' && data.source_type !== 'upload') {
      setTimeout(() => {
        fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resourceId: newResource.id }),
        }).catch((err) => console.warn('Background AI analysis trigger failed:', err));
      }, 50);
    }

    return newResource;
  }

  static async updateResource(id: string, updates: Partial<ResourceModel>): Promise<ResourceModel | null> {
    const all = await this.getAllResources();
    let updatedResource: ResourceModel | null = null;

    const next = all.map((r) => {
      if (r.id === id) {
        updatedResource = {
          ...r,
          ...updates,
          updated_at: new Date().toISOString(),
        };
        return updatedResource;
      }
      return r;
    });

    if (updatedResource) {
      setLocalItem(STORAGE_KEYS.RESOURCES, next);
    }
    return updatedResource;
  }

  static async recordOpen(id: string): Promise<void> {
    await this.updateResource(id, {
      last_opened_at: new Date().toISOString(),
    });
  }

  static async toggleFavorite(id: string): Promise<boolean> {
    const res = await this.getResourceById(id);
    if (!res) return false;
    const nextState = !res.is_favorite;
    await this.updateResource(id, { is_favorite: nextState });
    return nextState;
  }

  static async setArchived(id: string, is_archived: boolean): Promise<void> {
    await this.updateResource(id, { is_archived });
  }

  static async deleteResource(id: string): Promise<boolean> {
    const all = await this.getAllResources();
    const next = all.filter((r) => r.id !== id);
    setLocalItem(STORAGE_KEYS.RESOURCES, next);

    // Also remove from intelligence store
    const intelMap = getLocalItem<Record<string, ResourceIntelligence>>(STORAGE_KEYS.INTELLIGENCE, SEED_INTELLIGENCE);
    delete intelMap[id];
    setLocalItem(STORAGE_KEYS.INTELLIGENCE, intelMap);

    // Also delete document & page records
    const docs = getLocalItem<Record<string, DocumentModel>>(STORAGE_KEYS.DOCUMENTS, SEED_DOCUMENTS);
    delete docs[id];
    setLocalItem(STORAGE_KEYS.DOCUMENTS, docs);

    return true;
  }

  // -----------------------------------------------------------
  // DOCUMENTS & PAGES
  // -----------------------------------------------------------

  static async getDocumentByResourceId(resourceId: string): Promise<DocumentModel | null> {
    this.initStore();
    const docs = getLocalItem<Record<string, DocumentModel>>(STORAGE_KEYS.DOCUMENTS, SEED_DOCUMENTS);
    return docs[resourceId] || null;
  }

  static async getDocumentByHash(contentHash: string): Promise<DocumentModel | null> {
    this.initStore();
    const docs = getLocalItem<Record<string, DocumentModel>>(STORAGE_KEYS.DOCUMENTS, SEED_DOCUMENTS);
    return Object.values(docs).find((d) => d.content_hash === contentHash) || null;
  }

  static async saveDocumentRecord(docData: {
    resource_id: string;
    user_id: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    storage_path: string;
    page_count: number;
    extraction_status: any;
    extracted_text: string;
    content_hash: string;
    pages: { pageNumber: number; content: string }[];
  }): Promise<DocumentModel> {
    this.initStore();
    const docs = getLocalItem<Record<string, DocumentModel>>(STORAGE_KEYS.DOCUMENTS, SEED_DOCUMENTS);

    const newDoc: DocumentModel = {
      id: `doc-${Date.now()}`,
      resource_id: docData.resource_id,
      user_id: docData.user_id,
      file_name: docData.file_name,
      file_size: docData.file_size,
      mime_type: docData.mime_type,
      storage_path: docData.storage_path,
      page_count: docData.page_count,
      extraction_status: docData.extraction_status,
      extracted_text: docData.extracted_text,
      content_hash: docData.content_hash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    docs[docData.resource_id] = newDoc;
    setLocalItem(STORAGE_KEYS.DOCUMENTS, docs);

    // Save page records
    const allPages = getLocalItem<Record<string, DocumentPageModel[]>>(STORAGE_KEYS.DOCUMENT_PAGES, {});
    allPages[newDoc.id] = docData.pages.map((p) => ({
      id: `page-${newDoc.id}-${p.pageNumber}`,
      document_id: newDoc.id,
      page_number: p.pageNumber,
      content: p.content,
      created_at: new Date().toISOString(),
    }));
    setLocalItem(STORAGE_KEYS.DOCUMENT_PAGES, allPages);

    return newDoc;
  }

  static async getDocumentPages(documentId: string): Promise<DocumentPageModel[]> {
    this.initStore();
    const allPages = getLocalItem<Record<string, DocumentPageModel[]>>(STORAGE_KEYS.DOCUMENT_PAGES, {});
    return allPages[documentId] || [];
  }

  static async searchDocumentPages(documentId: string, query: string): Promise<DocumentPageModel[]> {
    const pages = await this.getDocumentPages(documentId);
    if (!query.trim()) return pages;
    const q = query.toLowerCase().trim();
    return pages.filter((p) => p.content.toLowerCase().includes(q));
  }

  // -----------------------------------------------------------
  // AI RESOURCE INTELLIGENCE
  // -----------------------------------------------------------

  static async getIntelligence(resourceId: string): Promise<ResourceIntelligence | null> {
    this.initStore();
    const map = getLocalItem<Record<string, ResourceIntelligence>>(STORAGE_KEYS.INTELLIGENCE, SEED_INTELLIGENCE);
    return map[resourceId] || null;
  }

  static async getAllIntelligence(): Promise<ResourceIntelligence[]> {
    this.initStore();
    const map = getLocalItem<Record<string, ResourceIntelligence>>(STORAGE_KEYS.INTELLIGENCE, SEED_INTELLIGENCE);
    return Object.values(map);
  }

  static async saveIntelligence(
    intel: Omit<ResourceIntelligence, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ): Promise<ResourceIntelligence> {
    this.initStore();
    const map = getLocalItem<Record<string, ResourceIntelligence>>(STORAGE_KEYS.INTELLIGENCE, SEED_INTELLIGENCE);
    const existing = map[intel.resource_id];

    const saved: ResourceIntelligence = {
      id: intel.id || existing?.id || `intel-${Date.now()}`,
      resource_id: intel.resource_id,
      user_id: intel.user_id,
      status: intel.status,
      summary: intel.summary,
      what_it_is: intel.what_it_is,
      best_for: intel.best_for,
      key_points: intel.key_points,
      topics: intel.topics,
      suggested_tags: intel.suggested_tags,
      suggested_use_cases: intel.suggested_use_cases,
      confidence: intel.confidence,
      model: intel.model,
      error_message: intel.error_message,
      content_hash: intel.content_hash,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    map[intel.resource_id] = saved;
    setLocalItem(STORAGE_KEYS.INTELLIGENCE, map);
    return saved;
  }

  static async acceptSuggestedTag(resourceId: string, tag: string): Promise<void> {
    const res = await this.getResourceById(resourceId);
    const intel = await this.getIntelligence(resourceId);
    if (!res) return;

    const currentTags = res.tags || [];
    if (!currentTags.includes(tag)) {
      await this.updateResource(resourceId, {
        tags: [...currentTags, tag],
        tag_sources: { ...(res.tag_sources || {}), [tag]: 'ai' },
      });
    }

    if (intel) {
      await this.saveIntelligence({
        ...intel,
        suggested_tags: (intel.suggested_tags || []).filter((t) => t !== tag),
      });
    }
  }

  static async dismissSuggestedTag(resourceId: string, tag: string): Promise<void> {
    const intel = await this.getIntelligence(resourceId);
    if (!intel) return;

    await this.saveIntelligence({
      ...intel,
      suggested_tags: (intel.suggested_tags || []).filter((t) => t !== tag),
    });
  }

  static async acceptSuggestedUseCase(resourceId: string, useCase: string): Promise<void> {
    const res = await this.getResourceById(resourceId);
    const intel = await this.getIntelligence(resourceId);
    if (!res) return;

    const currentUcs = res.use_cases || [];
    if (!currentUcs.includes(useCase)) {
      await this.updateResource(resourceId, {
        use_cases: [...currentUcs, useCase],
        use_case_sources: { ...(res.use_case_sources || {}), [useCase]: 'ai' },
      });
    }

    if (intel) {
      await this.saveIntelligence({
        ...intel,
        suggested_use_cases: (intel.suggested_use_cases || []).filter((u) => u !== useCase),
      });
    }
  }

  static async dismissSuggestedUseCase(resourceId: string, useCase: string): Promise<void> {
    const intel = await this.getIntelligence(resourceId);
    if (!intel) return;

    await this.saveIntelligence({
      ...intel,
      suggested_use_cases: (intel.suggested_use_cases || []).filter((u) => u !== useCase),
    });
  }

  static async findRelatedResources(resourceId: string, limit = 4): Promise<ResourceModel[]> {
    const current = await this.getResourceById(resourceId);
    if (!current) return [];

    const intel = await this.getIntelligence(resourceId);
    const all = await this.getAllResources();
    const candidates = all.filter((r) => r.id !== resourceId && !r.is_archived);

    const scored = candidates.map((item) => {
      let score = 0;

      if (current.tags && item.tags) {
        const sharedTags = current.tags.filter((t) => item.tags?.includes(t));
        score += sharedTags.length * 3;
      }

      if (current.use_cases && item.use_cases) {
        const sharedUcs = current.use_cases.filter((u) => item.use_cases?.includes(u));
        score += sharedUcs.length * 3;
      }

      if (current.resource_type === item.resource_type) {
        score += 2;
      }

      if (current.domain === item.domain) {
        score += 2;
      }

      if (intel && intel.topics && item.tags) {
        const sharedTopics = intel.topics.filter((top) =>
          item.tags?.some((t) => t.toLowerCase() === top.toLowerCase())
        );
        score += sharedTopics.length * 2;
      }

      return { resource: item, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.resource);
  }

  // -----------------------------------------------------------
  // COLLECTIONS & PROJECTS
  // -----------------------------------------------------------

  static async getCollections(): Promise<CollectionModel[]> {
    this.initStore();
    return getLocalItem<CollectionModel[]>(STORAGE_KEYS.COLLECTIONS, SEED_COLLECTIONS);
  }

  static async createCollection(name: string, description: string, topic?: string): Promise<CollectionModel> {
    const all = await this.getCollections();
    const newCol: CollectionModel = {
      id: `col-${Date.now()}`,
      user_id: 'usr_local',
      name,
      description,
      topic: topic || 'Custom Stack',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resource_ids: [],
    };
    setLocalItem(STORAGE_KEYS.COLLECTIONS, [newCol, ...all]);
    return newCol;
  }

  static async getProjects(): Promise<ProjectModel[]> {
    this.initStore();
    return getLocalItem<ProjectModel[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
  }

  static async getProjectById(id: string): Promise<ProjectModel | null> {
    const all = await this.getProjects();
    return all.find((p) => p.id === id) || null;
  }

  static async createProject(data: {
    name: string;
    description: string;
    objective?: string;
    status?: ProjectModel['status'];
    project_type?: ProjectModel['project_type'];
    template_id?: string;
    technologies?: string[];
    constraints?: string;
    target_users?: string;
    keywords?: string[];
    groups?: string[];
    color?: string;
  }): Promise<ProjectModel> {
    const all = await this.getProjects();
    const newProj: ProjectModel = {
      id: `proj-${Date.now()}`,
      user_id: 'usr_local',
      name: data.name,
      description: data.description,
      objective: data.objective || '',
      status: data.status || 'active',
      project_type: data.project_type || 'software_project',
      template_id: data.template_id,
      color: data.color || '#6366f1',
      technologies: data.technologies || [],
      constraints: data.constraints || '',
      target_users: data.target_users || '',
      keywords: data.keywords || [],
      groups: data.groups || ['General Research', 'Technical Stack', 'Implementation'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_opened_at: new Date().toISOString(),
      resource_ids: [],
    };
    setLocalItem(STORAGE_KEYS.PROJECTS, [newProj, ...all]);
    return newProj;
  }

  static async updateProject(id: string, updates: Partial<ProjectModel>): Promise<ProjectModel | null> {
    const all = await this.getProjects();
    let updated: ProjectModel | null = null;
    const next = all.map((p) => {
      if (p.id === id) {
        updated = { ...p, ...updates, updated_at: new Date().toISOString() };
        return updated;
      }
      return p;
    });
    if (updated) {
      setLocalItem(STORAGE_KEYS.PROJECTS, next);
    }
    return updated;
  }

  static async deleteProject(id: string): Promise<boolean> {
    const all = await this.getProjects();
    const next = all.filter((p) => p.id !== id);
    setLocalItem(STORAGE_KEYS.PROJECTS, next);

    // Clean up project notes and decisions
    const notesMap = getLocalItem<Record<string, ProjectNoteModel[]>>(STORAGE_KEYS.PROJECT_NOTES, SEED_PROJECT_NOTES);
    delete notesMap[id];
    setLocalItem(STORAGE_KEYS.PROJECT_NOTES, notesMap);

    const decMap = getLocalItem<Record<string, ProjectDecisionModel[]>>(STORAGE_KEYS.PROJECT_DECISIONS, SEED_PROJECT_DECISIONS);
    delete decMap[id];
    setLocalItem(STORAGE_KEYS.PROJECT_DECISIONS, decMap);

    return true;
  }

  static async archiveProject(id: string, isArchived: boolean): Promise<void> {
    await this.updateProject(id, { status: isArchived ? 'archived' : 'active' });
  }

  // --- Project Resource Relationships (Zero Resource Duplication) ---

  static async addResourceToProject(projectId: string, resourceId: string, groupName = 'General'): Promise<void> {
    const project = await this.getProjectById(projectId);
    if (!project) return;

    const current = project.resource_ids || [];
    if (!current.includes(resourceId)) {
      await this.updateProject(projectId, {
        resource_ids: [...current, resourceId],
      });
    }

    // Save junction metadata
    const junctionKey = `${projectId}_${resourceId}`;
    const allJunctions = getLocalItem<Record<string, any>>(STORAGE_KEYS.PROJECT_RESOURCES, {});
    allJunctions[junctionKey] = {
      id: `pr-${Date.now()}`,
      project_id: projectId,
      resource_id: resourceId,
      status: 'saved',
      is_important: false,
      group_name: groupName,
      created_at: new Date().toISOString(),
    };
    setLocalItem(STORAGE_KEYS.PROJECT_RESOURCES, allJunctions);
  }

  static async removeResourceFromProject(projectId: string, resourceId: string): Promise<void> {
    const project = await this.getProjectById(projectId);
    if (!project) return;

    const current = project.resource_ids || [];
    await this.updateProject(projectId, {
      resource_ids: current.filter((id) => id !== resourceId),
    });

    const junctionKey = `${projectId}_${resourceId}`;
    const allJunctions = getLocalItem<Record<string, any>>(STORAGE_KEYS.PROJECT_RESOURCES, {});
    delete allJunctions[junctionKey];
    setLocalItem(STORAGE_KEYS.PROJECT_RESOURCES, allJunctions);
  }

  static async bulkAddResourcesToProject(projectId: string, resourceIds: string[]): Promise<void> {
    const project = await this.getProjectById(projectId);
    if (!project) return;

    const current = new Set(project.resource_ids || []);
    for (const rId of resourceIds) current.add(rId);

    await this.updateProject(projectId, {
      resource_ids: Array.from(current),
    });
  }

  static async toggleProjectImportant(projectId: string, resourceId: string): Promise<boolean> {
    const junctionKey = `${projectId}_${resourceId}`;
    const allJunctions = getLocalItem<Record<string, any>>(STORAGE_KEYS.PROJECT_RESOURCES, {});
    const existing = allJunctions[junctionKey] || {
      id: `pr-${Date.now()}`,
      project_id: projectId,
      resource_id: resourceId,
      status: 'saved',
      is_important: false,
      group_name: 'General',
      created_at: new Date().toISOString(),
    };

    const nextState = !existing.is_important;
    allJunctions[junctionKey] = { ...existing, is_important: nextState };
    setLocalItem(STORAGE_KEYS.PROJECT_RESOURCES, allJunctions);
    return nextState;
  }

  static async setProjectResourceStatus(projectId: string, resourceId: string, status: string): Promise<void> {
    const junctionKey = `${projectId}_${resourceId}`;
    const allJunctions = getLocalItem<Record<string, any>>(STORAGE_KEYS.PROJECT_RESOURCES, {});
    const existing = allJunctions[junctionKey] || {
      id: `pr-${Date.now()}`,
      project_id: projectId,
      resource_id: resourceId,
      status: 'saved',
      is_important: false,
      group_name: 'General',
      created_at: new Date().toISOString(),
    };

    allJunctions[junctionKey] = { ...existing, status };
    setLocalItem(STORAGE_KEYS.PROJECT_RESOURCES, allJunctions);
  }

  static async setProjectResourceGroup(projectId: string, resourceId: string, group_name: string): Promise<void> {
    const junctionKey = `${projectId}_${resourceId}`;
    const allJunctions = getLocalItem<Record<string, any>>(STORAGE_KEYS.PROJECT_RESOURCES, {});
    const existing = allJunctions[junctionKey] || {
      id: `pr-${Date.now()}`,
      project_id: projectId,
      resource_id: resourceId,
      status: 'saved',
      is_important: false,
      group_name: 'General',
      created_at: new Date().toISOString(),
    };

    allJunctions[junctionKey] = { ...existing, group_name };
    setLocalItem(STORAGE_KEYS.PROJECT_RESOURCES, allJunctions);
  }

  static async getProjectJunctions(projectId: string): Promise<Record<string, any>> {
    const allJunctions = getLocalItem<Record<string, any>>(STORAGE_KEYS.PROJECT_RESOURCES, {});
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(allJunctions)) {
      if (v.project_id === projectId) {
        result[v.resource_id] = v;
      }
    }
    return result;
  }

  // --- Project Notes ---

  static async getProjectNotes(projectId: string): Promise<ProjectNoteModel[]> {
    this.initStore();
    const map = getLocalItem<Record<string, ProjectNoteModel[]>>(STORAGE_KEYS.PROJECT_NOTES, SEED_PROJECT_NOTES);
    return map[projectId] || [];
  }

  static async createProjectNote(projectId: string, title: string, content: string): Promise<ProjectNoteModel> {
    this.initStore();
    const map = getLocalItem<Record<string, ProjectNoteModel[]>>(STORAGE_KEYS.PROJECT_NOTES, SEED_PROJECT_NOTES);
    const existing = map[projectId] || [];
    const newNote: ProjectNoteModel = {
      id: `note-${Date.now()}`,
      project_id: projectId,
      user_id: 'usr_local',
      title: title.trim(),
      content: content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    map[projectId] = [newNote, ...existing];
    setLocalItem(STORAGE_KEYS.PROJECT_NOTES, map);
    return newNote;
  }

  static async deleteProjectNote(projectId: string, noteId: string): Promise<void> {
    this.initStore();
    const map = getLocalItem<Record<string, ProjectNoteModel[]>>(STORAGE_KEYS.PROJECT_NOTES, SEED_PROJECT_NOTES);
    const existing = map[projectId] || [];
    map[projectId] = existing.filter((n) => n.id !== noteId);
    setLocalItem(STORAGE_KEYS.PROJECT_NOTES, map);
  }

  // --- Project Decisions Log ---

  static async getProjectDecisions(projectId: string): Promise<ProjectDecisionModel[]> {
    this.initStore();
    const map = getLocalItem<Record<string, ProjectDecisionModel[]>>(STORAGE_KEYS.PROJECT_DECISIONS, SEED_PROJECT_DECISIONS);
    return map[projectId] || [];
  }

  static async createProjectDecision(projectId: string, decision: string, reason: string, date?: string): Promise<ProjectDecisionModel> {
    this.initStore();
    const map = getLocalItem<Record<string, ProjectDecisionModel[]>>(STORAGE_KEYS.PROJECT_DECISIONS, SEED_PROJECT_DECISIONS);
    const existing = map[projectId] || [];
    const newDecision: ProjectDecisionModel = {
      id: `dec-${Date.now()}`,
      project_id: projectId,
      user_id: 'usr_local',
      decision: decision.trim(),
      reason: reason.trim(),
      date: date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };
    map[projectId] = [newDecision, ...existing];
    setLocalItem(STORAGE_KEYS.PROJECT_DECISIONS, map);
    return newDecision;
  }

  static async deleteProjectDecision(projectId: string, decisionId: string): Promise<void> {
    this.initStore();
    const map = getLocalItem<Record<string, ProjectDecisionModel[]>>(STORAGE_KEYS.PROJECT_DECISIONS, SEED_PROJECT_DECISIONS);
    const existing = map[projectId] || [];
    map[projectId] = existing.filter((d) => d.id !== decisionId);
    setLocalItem(STORAGE_KEYS.PROJECT_DECISIONS, map);
  }

  // --- Recommendation Dismissals ---

  static async getDismissedRecommendations(projectId: string): Promise<string[]> {
    const map = getLocalItem<Record<string, string[]>>(STORAGE_KEYS.PROJECT_DISMISSALS, {});
    return map[projectId] || [];
  }

  static async dismissRecommendation(projectId: string, resourceId: string): Promise<void> {
    const map = getLocalItem<Record<string, string[]>>(STORAGE_KEYS.PROJECT_DISMISSALS, {});
    const existing = map[projectId] || [];
    if (!existing.includes(resourceId)) {
      map[projectId] = [...existing, resourceId];
      setLocalItem(STORAGE_KEYS.PROJECT_DISMISSALS, map);
    }
  }

  // --- Cross-Project Resource Usage ---

  static async getCrossProjectUsage(resourceId: string): Promise<ProjectModel[]> {
    const all = await this.getProjects();
    return all.filter((p) => p.resource_ids?.includes(resourceId));
  }

  static async getMetrics() {
    const resources = await this.getAllResources();
    const projects = await this.getProjects();
    const collections = await this.getCollections();
    const intelList = await this.getAllIntelligence();

    const activeResources = resources.filter((r) => !r.is_archived);
    const inbox = activeResources.filter((r) => r.is_inbox);
    const favorites = activeResources.filter((r) => r.is_favorite);
    const documents = activeResources.filter((r) => r.resource_type === 'pdf' || r.resource_type === 'document');

    const analyzedCount = intelList.filter((i) => i.status === 'completed').length;

    const allTopics = new Set<string>();
    for (const intel of intelList) {
      if (intel.topics) {
        for (const t of intel.topics) allTopics.add(t);
      }
    }

    return {
      total: activeResources.length,
      inbox: inbox.length,
      favorites: favorites.length,
      documents: documents.length,
      projects: projects.length,
      collections: collections.length,
      analyzed: analyzedCount,
      discoveredTopics: Array.from(allTopics).slice(0, 6),
    };
  }
}
