import { ProjectType } from '@/types/database';

export interface ProjectTemplate {
  id: string;
  name: string;
  projectType: ProjectType;
  description: string;
  icon: string;
  defaultObjective: string;
  suggestedTechnologies: string[];
  defaultGroups: string[];
  starterChecklist: string[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'hackathon',
    name: 'Hackathon Project',
    projectType: 'hackathon',
    description: 'Rapid prototyping sprint with pitch preparation, judging rubric alignment, and core build stack.',
    icon: 'Trophy',
    defaultObjective: 'Build a working AI prototype and pitch deck within the sprint timeframe.',
    suggestedTechnologies: ['Next.js', 'TypeScript', 'Supabase', 'TailwindCSS', 'NVIDIA Nemotron API'],
    defaultGroups: [
      'Problem Research',
      'Existing Solutions',
      'Technology & APIs',
      'UI & Design Inspiration',
      'Implementation',
      'Pitch & Presentation',
    ],
    starterChecklist: [
      'Define core problem statement and target user persona',
      'Validate sponsor API keys and platform limits',
      'Assemble technical research & boilerplate stack',
      'Select UI library & design inspiration tokens',
      'Build minimal working end-to-end prototype',
      'Prepare slide deck and 2-minute demo video',
    ],
  },
  {
    id: 'software_project',
    name: 'SaaS / Software Product',
    projectType: 'software_project',
    description: 'Production architecture, database modeling, authentication workflows, and deployment pipeline.',
    icon: 'Layers',
    defaultObjective: 'Engineer a scalable, production-ready SaaS application with secure multi-tenant isolation.',
    suggestedTechnologies: ['React', 'Next.js', 'PostgreSQL', 'Prisma / Drizzle', 'Stripe', 'Docker'],
    defaultGroups: [
      'System Architecture',
      'Database Schema',
      'Authentication & Security',
      'Frontend & UI System',
      'Integrations & Webhooks',
      'Deployment & Monitoring',
    ],
    starterChecklist: [
      'Establish database schema with Row Level Security',
      'Configure authentication and RBAC workflows',
      'Implement core business logic services',
      'Set up payment gateway and customer portal',
      'Audit API response times and caching policies',
      'Automate CI/CD test suite and production build',
    ],
  },
  {
    id: 'research',
    name: 'Academic / Research Study',
    projectType: 'research',
    description: 'Formal literature review, whitepapers, benchmark data, and methodological analysis.',
    icon: 'BookOpen',
    defaultObjective: 'Conduct a comprehensive literature review and synthesize comparative findings.',
    suggestedTechnologies: ['Python', 'PyTorch', 'Jupyter', 'arXiv', 'Hugging Face'],
    defaultGroups: [
      'Foundational Papers',
      'Methodology & Benchmarks',
      'Dataset Documentation',
      'Comparative Studies',
      'Citations & Drafts',
    ],
    starterChecklist: [
      'Collect primary survey and seminal whitepapers',
      'Index benchmark metrics across competitive architectures',
      'Extract page-level citations for literature review',
      'Document experiment parameters and ablation results',
    ],
  },
  {
    id: 'startup',
    name: 'Startup Venture',
    projectType: 'startup',
    description: 'Market research, customer interviews, competitor analysis, technical build, and go-to-market.',
    icon: 'Rocket',
    defaultObjective: 'Validate product-market fit, interview prospective customers, and deploy MVP.',
    suggestedTechnologies: ['Next.js', 'PostgreSQL', 'PostHog', 'Resend', 'Vercel'],
    defaultGroups: [
      'Market Research',
      'Competitor Analysis',
      'Customer Interviews',
      'Product Spec & MVP',
      'Go-To-Market & Growth',
    ],
    starterChecklist: [
      'Analyze competitor strengths and pricing tiers',
      'Synthesize 10 customer discovery interview notes',
      'Define MVP scope and critical value path',
      'Launch waitlist or early-access beta campaign',
    ],
  },
  {
    id: 'freelance',
    name: 'Freelance Client Project',
    projectType: 'freelance',
    description: 'Client deliverables, design briefs, technical specifications, and handover documentation.',
    icon: 'Briefcase',
    defaultObjective: 'Deliver client milestone on schedule with clean handover documentation.',
    suggestedTechnologies: ['Next.js', 'TailwindCSS', 'Headless CMS', 'Stripe', 'Vercel'],
    defaultGroups: [
      'Client Brief & Scope',
      'Design Inspiration',
      'Competitor Benchmarks',
      'Technical Specs',
      'Handover & Guides',
    ],
    starterChecklist: [
      'Review client project brief and constraints',
      'Create mood board and UI component inventory',
      'Build deliverables in progressive milestones',
      'Prepare staging preview and handover guide',
    ],
  },
  {
    id: 'learning',
    name: 'Learning & Skill Mastery',
    projectType: 'learning',
    description: 'Structured tutorials, cheat sheets, code sandboxes, and concept deep dives.',
    icon: 'GraduationCap',
    defaultObjective: 'Master a new technology or paradigm through hands-on exercises and curated guides.',
    suggestedTechnologies: ['TypeScript', 'Rust', 'Go', 'Kubernetes', 'WebGPU'],
    defaultGroups: [
      'Official Guides & Docs',
      'Tutorials & Walkthroughs',
      'Architecture References',
      'Exercises & Sandboxes',
      'Notes & Summaries',
    ],
    starterChecklist: [
      'Work through foundational documentation and quickstarts',
      'Deconstruct real-world open-source repositories',
      'Build a practical capstone project applying concepts',
      'Synthesize key takeaways into personal reference notes',
    ],
  },
];
