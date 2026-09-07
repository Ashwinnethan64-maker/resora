export type ResourceType =
  | 'website'
  | 'web_app'
  | 'ai_tool'
  | 'developer_tool'
  | 'article'
  | 'tutorial'
  | 'github'
  | 'video'
  | 'social_post'
  | 'pdf'
  | 'document'
  | 'other';

export type SourceType =
  | 'web'
  | 'manual'
  | 'upload'
  | 'import'
  | 'social'
  | 'document'
  | 'external_document';

export type IntelligenceStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type IntelligenceConfidence = 'high' | 'medium' | 'low';
export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'unsupported';

export interface ResourceModel {
  id: string;
  user_id: string;
  title: string;
  url: string;
  domain: string;
  description?: string;
  resource_type: ResourceType;
  source_type: SourceType;
  thumbnail_url?: string;
  favicon_url?: string;
  content?: string;
  personal_note?: string;
  is_favorite: boolean;
  is_archived: boolean;
  is_inbox: boolean;
  created_at: string;
  updated_at: string;
  last_opened_at?: string;
  tags?: string[];
  use_cases?: string[];
  tag_sources?: Record<string, 'user' | 'ai'>;
  use_case_sources?: Record<string, 'user' | 'ai'>;
  // Associated Document Metadata & Extraction Lineage
  document_id?: string;
  source_document_id?: string;
  original_url?: string;
  normalized_url?: string;
  file_name?: string;
  file_size?: number;
  page_count?: number;
  mime_type?: string;
  storage_path?: string;
  extraction_status?: ExtractionStatus;
}

export interface DocumentModel {
  id: string;
  resource_id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  page_count: number;
  extraction_status: ExtractionStatus;
  extracted_text?: string;
  content_hash: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentPageModel {
  id: string;
  document_id: string;
  page_number: number;
  content: string;
  created_at: string;
}

export interface ResourceIntelligence {
  id: string;
  resource_id: string;
  user_id: string;
  status: IntelligenceStatus;
  summary: string;
  what_it_is: string;
  best_for: string[];
  key_points: string[];
  topics: string[];
  suggested_tags: string[];
  suggested_use_cases: string[];
  confidence: IntelligenceConfidence;
  model: string;
  error_message?: string;
  content_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface TagModel {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface UseCaseModel {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface CollectionModel {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  topic?: string;
  created_at: string;
  updated_at: string;
  resource_ids?: string[];
}

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';

export type ProjectType =
  | 'hackathon'
  | 'software_project'
  | 'research'
  | 'startup'
  | 'freelance'
  | 'learning'
  | 'personal'
  | 'other';

export type ProjectResourceStatus = 'saved' | 'reviewing' | 'useful' | 'used' | 'reference';

export interface ProjectModel {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  objective?: string;
  status: ProjectStatus | 'Active' | 'Planned' | 'Archived' | 'In Review';
  project_type?: ProjectType;
  color: string;
  technologies?: string[];
  constraints?: string;
  target_users?: string;
  keywords?: string[];
  template_id?: string;
  created_at: string;
  updated_at: string;
  last_opened_at?: string;
  resource_ids?: string[];
  groups?: string[];
}

export interface ProjectResourceModel {
  id: string;
  project_id: string;
  resource_id: string;
  status: ProjectResourceStatus;
  is_important: boolean;
  group_name: string;
  created_at: string;
  added_by?: string;
}

export interface ProjectNoteModel {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDecisionModel {
  id: string;
  project_id: string;
  user_id: string;
  decision: string;
  reason: string;
  date: string;
  created_at: string;
}

export interface ProjectRecommendationModel {
  resource: ResourceModel;
  relevance: 'Highly relevant' | 'Relevant' | 'Possibly useful';
  score: number;
  reasons: string[];
}

export interface ResourceFilterOptions {
  query?: string;
  resourceType?: string;
  sourceType?: string;
  tag?: string;
  useCase?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  isInbox?: boolean;
  sortBy?: 'newest' | 'oldest' | 'recently_opened' | 'alphabetical' | 'recently_updated';
}

export interface ExtractedMetadata {
  title?: string;
  description?: string;
  domain: string;
  canonicalUrl?: string;
  favicon?: string;
  image?: string;
  detectedType: ResourceType;
  detectedSource: SourceType;
}

// ==========================================
// PHASE 6: AI RESEARCH ASSISTANT & RAG TYPES
// ==========================================

export type AssistantScopeType = 'library' | 'project' | 'collection' | 'document' | 'documents' | 'tools' | 'favorites';
export type AssistantRole = 'user' | 'assistant' | 'system';

export interface AssistantCitation {
  resource_id: string;
  title: string;
  domain: string;
  resource_type: ResourceType;
  url?: string;
  document_id?: string;
  page_number?: number;
  snippet?: string;
  relevance_score?: number;
}

export interface AssistantMessageModel {
  id: string;
  conversation_id: string;
  user_id: string;
  role: AssistantRole;
  content: string;
  citations?: AssistantCitation[];
  used_resource_ids?: string[];
  created_at: string;
}

export interface AssistantConversationModel {
  id: string;
  user_id: string;
  title: string;
  scope_type: AssistantScopeType;
  scope_id?: string;
  scope_label?: string;
  created_at: string;
  updated_at: string;
  messages?: AssistantMessageModel[];
}

export interface ResourceChunkModel {
  id: string;
  resource_id: string;
  user_id: string;
  chunk_index: number;
  content: string;
  embedding?: number[];
  created_at: string;
}

export interface DocumentChunkModel {
  id: string;
  document_id: string;
  user_id: string;
  page_number: number;
  chunk_index: number;
  heading?: string;
  content: string;
  embedding?: number[];
  created_at: string;
}

export interface SavedAnswerModel {
  id: string;
  user_id: string;
  conversation_id?: string;
  title: string;
  content: string;
  citations?: AssistantCitation[];
  created_at: string;
}
