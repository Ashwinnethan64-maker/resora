import { ResourceType } from '@/types/database';

export interface ResourceTypeConfig {
  id: ResourceType;
  label: string;
  iconName: string;
  badgeClass: string;
}

export const RESOURCE_TYPE_CONFIGS: Record<ResourceType, ResourceTypeConfig> = {
  website: {
    id: 'website',
    label: 'Website',
    iconName: 'Globe',
    badgeClass: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
  },
  web_app: {
    id: 'web_app',
    label: 'Web App',
    iconName: 'Smartphone',
    badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
  },
  ai_tool: {
    id: 'ai_tool',
    label: 'AI Tool',
    iconName: 'Bot',
    badgeClass: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
  },
  developer_tool: {
    id: 'developer_tool',
    label: 'Developer Tool',
    iconName: 'Code2',
    badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
  },
  article: {
    id: 'article',
    label: 'Article',
    iconName: 'FileText',
    badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
  },
  tutorial: {
    id: 'tutorial',
    label: 'Tutorial',
    iconName: 'GraduationCap',
    badgeClass: 'bg-pink-500/10 text-pink-300 border-pink-500/25',
  },
  github: {
    id: 'github',
    label: 'GitHub Repository',
    iconName: 'Github',
    badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  },
  video: {
    id: 'video',
    label: 'Video',
    iconName: 'Video',
    badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
  },
  social_post: {
    id: 'social_post',
    label: 'Social Post',
    iconName: 'Share2',
    badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
  },
  pdf: {
    id: 'pdf',
    label: 'PDF',
    iconName: 'File',
    badgeClass: 'bg-orange-500/10 text-orange-300 border-orange-500/25',
  },
  document: {
    id: 'document',
    label: 'Document',
    iconName: 'Folder',
    badgeClass: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/25',
  },
  other: {
    id: 'other',
    label: 'Other',
    iconName: 'Link',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  },
};

export const INITIAL_SUGGESTED_USE_CASES = [
  'Build',
  'Research',
  'Learn',
  'Design',
  'Code',
  'Deploy',
  'Validate',
  'Automate',
  'Present',
  'Hackathon',
  'Freelancing',
  'Startup',
];

export const INITIAL_SUGGESTED_TAGS = [
  'AI',
  'Coding',
  'Hackathon',
  'Design',
  'Research',
  'Frontend',
  'Backend',
  'SaaS',
  'Automation',
  'Learning',
  'Startup',
  'Productivity',
];
