export type ResourceType =
  | 'Website'
  | 'Web App'
  | 'AI Tool'
  | 'Developer Tool'
  | 'PDF'
  | 'GitHub Repository'
  | 'Tutorial'
  | 'Video'
  | 'Social Post'
  | 'Document';

export type ResourceSource =
  | 'Web'
  | 'GitHub'
  | 'PDF Upload'
  | 'X/Twitter'
  | 'YouTube'
  | 'ArXiv'
  | 'Documentation'
  | 'Manual Note';

export interface Resource {
  id: string;
  title: string;
  url: string;
  domain: string;
  description: string;
  resourceType: ResourceType;
  source: ResourceSource;
  thumbnail?: string;
  favicon?: string;
  tags: string[];
  useCases: string[];
  isFavorite: boolean;
  savedAt: string; // ISO or human readable
  updatedAt: string;
  notes?: string;
  relatedResourceIds?: string[];
  // Inbox-specific triage fields
  isInbox?: boolean;
  suggestedType?: ResourceType;
  suggestedTopics?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  resourceCount: number;
  lastUpdated: string;
  status: 'Active' | 'Planned' | 'Archived' | 'In Review';
  color: string;
  resourceIds: string[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  topic: string;
  resourceCount: number;
  lastUpdated: string;
  previewIcons: string[];
  resourceIds: string[];
}

export interface DocumentResource {
  id: string;
  title: string;
  fileType: 'PDF' | 'Markdown' | 'Doc' | 'Research Paper';
  fileSize: string;
  pageCount?: number;
  summary: string;
  tags: string[];
  savedAt: string;
  url: string;
  useCases: string[];
}

export interface ToolResource {
  id: string;
  name: string;
  tagline: string;
  category: 'AI' | 'Development' | 'Design' | 'Productivity' | 'Research' | 'Automation' | 'Deployment';
  domain: string;
  url: string;
  tags: string[];
  pricing?: 'Free' | 'Freemium' | 'Open Source' | 'Paid';
  isFavorite: boolean;
  savedAt: string;
}

export interface QuickAccessItem {
  id: string;
  title: string;
  count: number;
  icon: string;
  color: string;
  route: string;
}
