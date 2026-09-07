import {
  AssistantConversationModel,
  AssistantMessageModel,
  AssistantScopeType,
  AIJobModel,
} from '@/types/database';
import { supabase, getSupabaseServerClient } from '@/lib/supabase';

const STORAGE_KEYS = {
  CONVERSATIONS: 'resora_ai_conversations_v1',
  MESSAGES: 'resora_ai_messages_v1',
  JOBS: 'resora_ai_jobs_v1',
};

// Local storage helpers
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota or private browsing errors
  }
}

// In-memory cache for server-side / runtime fallback
const memoryStore = {
  conversations: new Map<string, AssistantConversationModel>(),
  messages: new Map<string, AssistantMessageModel[]>(),
  jobs: new Map<string, AIJobModel>(),
};

function getClient() {
  if (typeof window === 'undefined') {
    return getSupabaseServerClient();
  }
  return supabase;
}

export class ConversationService {
  /**
   * Get or initialize the active conversation for a given scope
   */
  static async getActiveConversation(
    userId = 'usr_local',
    scopeType: AssistantScopeType = 'library',
    scopeId?: string
  ): Promise<AssistantConversationModel> {
    const supabase = getClient();
    if (supabase) {
      try {
        let query = supabase
          .from('ai_conversations')
          .select('*')
          .eq('user_id', userId)
          .eq('scope_type', scopeType)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (scopeId) {
          query = query.eq('scope_id', scopeId);
        } else {
          query = query.is('scope_id', null);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const conv = data[0] as AssistantConversationModel;
          const messages = await this.getMessages(conv.id);
          return { ...conv, messages };
        }
      } catch (err) {
        console.warn('[ConversationService] Supabase getActiveConversation failed, fallback to local store:', err);
      }
    }

    // Local / In-memory fallback
    const localConvs = typeof window !== 'undefined'
      ? getLocalItem<AssistantConversationModel[]>(STORAGE_KEYS.CONVERSATIONS, [])
      : Array.from(memoryStore.conversations.values());

    const found = localConvs.find(
      (c) => c.user_id === userId && c.scope_type === scopeType && (!scopeId || c.scope_id === scopeId)
    );

    if (found) {
      const messages = await this.getMessages(found.id);
      return { ...found, messages };
    }

    // Create new active conversation
    const newConv: AssistantConversationModel = {
      id: `conv_${Date.now()}`,
      user_id: userId,
      title: `Research Session: ${scopeType.toUpperCase()}`,
      scope_type: scopeType,
      scope_id: scopeId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [],
    };

    await this.saveConversation(newConv);
    return newConv;
  }

  /**
   * Save or update conversation metadata
   */
  static async saveConversation(conv: AssistantConversationModel): Promise<void> {
    const supabase = getClient();
    if (supabase) {
      try {
        await supabase.from('ai_conversations').upsert({
          id: conv.id,
          user_id: conv.user_id,
          title: conv.title,
          scope_type: conv.scope_type,
          scope_id: conv.scope_id || null,
          scope_label: conv.scope_label || null,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[ConversationService] Supabase saveConversation error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const convs = getLocalItem<AssistantConversationModel[]>(STORAGE_KEYS.CONVERSATIONS, []);
      const idx = convs.findIndex((c) => c.id === conv.id);
      if (idx >= 0) {
        convs[idx] = { ...convs[idx], ...conv, updated_at: new Date().toISOString() };
      } else {
        convs.unshift(conv);
      }
      setLocalItem(STORAGE_KEYS.CONVERSATIONS, convs);
    } else {
      memoryStore.conversations.set(conv.id, conv);
    }
  }

  /**
   * Reset / clear conversation messages
   */
  static async resetConversation(conversationId: string): Promise<void> {
    const supabase = getClient();
    if (supabase) {
      try {
        await supabase.from('ai_messages').delete().eq('conversation_id', conversationId);
      } catch (err) {
        console.warn('[ConversationService] Supabase resetConversation error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const messagesMap = getLocalItem<Record<string, AssistantMessageModel[]>>(STORAGE_KEYS.MESSAGES, {});
      delete messagesMap[conversationId];
      setLocalItem(STORAGE_KEYS.MESSAGES, messagesMap);
    } else {
      memoryStore.messages.delete(conversationId);
    }
  }

  /**
   * Get all messages for a conversation
   */
  static async getMessages(conversationId: string): Promise<AssistantMessageModel[]> {
    const supabase = getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('ai_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            conversation_id: d.conversation_id,
            user_id: d.user_id,
            role: d.role,
            content: d.content,
            citations: d.citations || [],
            used_resource_ids: d.used_resource_ids || [],
            created_at: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('[ConversationService] Supabase getMessages error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const messagesMap = getLocalItem<Record<string, AssistantMessageModel[]>>(STORAGE_KEYS.MESSAGES, {});
      return messagesMap[conversationId] || [];
    } else {
      return memoryStore.messages.get(conversationId) || [];
    }
  }

  /**
   * Append and persist a message to a conversation
   */
  static async addMessage(message: AssistantMessageModel): Promise<AssistantMessageModel> {
    const supabase = getClient();
    if (supabase) {
      try {
        await supabase.from('ai_messages').insert({
          id: message.id,
          conversation_id: message.conversation_id,
          user_id: message.user_id,
          role: message.role,
          content: message.content,
          citations: message.citations || [],
          used_resource_ids: message.used_resource_ids || [],
          created_at: message.created_at,
        });

        await supabase.from('ai_conversations').update({
          updated_at: new Date().toISOString(),
        }).eq('id', message.conversation_id);
      } catch (err) {
        console.warn('[ConversationService] Supabase addMessage error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const messagesMap = getLocalItem<Record<string, AssistantMessageModel[]>>(STORAGE_KEYS.MESSAGES, {});
      const list = messagesMap[message.conversation_id] || [];
      if (!list.some((m) => m.id === message.id)) {
        messagesMap[message.conversation_id] = [...list, message];
        setLocalItem(STORAGE_KEYS.MESSAGES, messagesMap);
      }
    } else {
      const list = memoryStore.messages.get(message.conversation_id) || [];
      if (!list.some((m) => m.id === message.id)) {
        memoryStore.messages.set(message.conversation_id, [...list, message]);
      }
    }

    return message;
  }

  // --- JOB QUEUE MANAGEMENT ---

  /**
   * Create an asynchronous AI Job
   */
  static async createJob(params: {
    conversationId: string;
    userId?: string;
    query: string;
    scopeType?: AssistantScopeType;
    scopeId?: string;
  }): Promise<AIJobModel> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const job: AIJobModel = {
      id: jobId,
      conversation_id: params.conversationId,
      user_id: params.userId || 'usr_local',
      status: 'queued',
      query: params.query,
      scope_type: params.scopeType || 'library',
      scope_id: params.scopeId,
      created_at: new Date().toISOString(),
    };

    const supabase = getClient();
    if (supabase) {
      try {
        await supabase.from('ai_jobs').insert({
          id: job.id,
          conversation_id: job.conversation_id,
          user_id: job.user_id,
          status: job.status,
          query: job.query,
          scope_type: job.scope_type,
          scope_id: job.scope_id || null,
          created_at: job.created_at,
        });
      } catch (err) {
        console.warn('[ConversationService] Supabase createJob error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const jobs = getLocalItem<Record<string, AIJobModel>>(STORAGE_KEYS.JOBS, {});
      jobs[job.id] = job;
      setLocalItem(STORAGE_KEYS.JOBS, jobs);
    } else {
      memoryStore.jobs.set(job.id, job);
    }

    return job;
  }

  /**
   * Get current job status
   */
  static async getJob(jobId: string): Promise<AIJobModel | null> {
    const supabase = getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('ai_jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (!error && data) {
          const job = data as AIJobModel;
          if (job.result_message_id) {
            const { data: msgData } = await supabase
              .from('ai_messages')
              .select('*')
              .eq('id', job.result_message_id)
              .single();
            if (msgData) {
              job.result_message = msgData as AssistantMessageModel;
            }
          }
          return job;
        }
      } catch (err) {
        console.warn('[ConversationService] Supabase getJob error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const jobs = getLocalItem<Record<string, AIJobModel>>(STORAGE_KEYS.JOBS, {});
      return jobs[jobId] || null;
    } else {
      return memoryStore.jobs.get(jobId) || null;
    }
  }

  /**
   * Update job status and attach result
   */
  static async updateJob(
    jobId: string,
    updates: {
      status: AIJobModel['status'];
      result_message_id?: string;
      result_message?: AssistantMessageModel;
      error?: string;
    }
  ): Promise<void> {
    const completed_at = updates.status === 'completed' || updates.status === 'failed' ? new Date().toISOString() : undefined;

    const supabase = getClient();
    if (supabase) {
      try {
        await supabase
          .from('ai_jobs')
          .update({
            status: updates.status,
            result_message_id: updates.result_message_id || null,
            error: updates.error || null,
            completed_at: completed_at || null,
          })
          .eq('id', jobId);
      } catch (err) {
        console.warn('[ConversationService] Supabase updateJob error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const jobs = getLocalItem<Record<string, AIJobModel>>(STORAGE_KEYS.JOBS, {});
      if (jobs[jobId]) {
        jobs[jobId] = {
          ...jobs[jobId],
          ...updates,
          completed_at: completed_at || jobs[jobId].completed_at,
        };
        setLocalItem(STORAGE_KEYS.JOBS, jobs);
      }
    } else {
      const job = memoryStore.jobs.get(jobId);
      if (job) {
        memoryStore.jobs.set(jobId, {
          ...job,
          ...updates,
          completed_at: completed_at || job.completed_at,
        });
      }
    }
  }
}
