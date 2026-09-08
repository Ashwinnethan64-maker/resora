'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import dynamic from 'next/dynamic';
import { SourceCard } from '@/components/assistant/SourceCard';

const DocumentViewerModal = dynamic(
  () => import('@/components/documents/DocumentViewerModal').then((mod) => mod.DocumentViewerModal),
  { ssr: false }
);
import {
  AssistantScopeType,
  AssistantMessageModel,
  ResourceModel,
} from '@/types/database';
import { ConversationService } from '@/lib/services/conversation-service';
import { PageHeader } from '@/components/ui/SectionLabel';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import {
  Send,
  Loader2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What AI coding tools did I save?',
  'Compare Supabase and Firebase based on my research.',
  'What resources can help with my hackathon project?',
  'Summarize compound AI systems from my papers.',
];

const STORAGE_ACTIVE_CONV = 'resora_assistant_active_conv_id';

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialScope = (searchParams.get('scope') as AssistantScopeType) || 'library';
  const initialScopeId = searchParams.get('scopeId') || undefined;

  const { resources, projects, collections, showToast, activeAiJob, trackAiJob, clearAiJob } = useResora();

  const [scopeType, setScopeType] = useState<AssistantScopeType>(initialScope);
  const [scopeId, setScopeId] = useState<string | undefined>(initialScopeId);
  const [conversationId, setConversationId] = useState<string>('conv_default');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<AssistantMessageModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [streamingCitations, setStreamingCitations] = useState<any[]>([]);
  const [streamingStatus, setStreamingStatus] = useState<'retrieving' | 'generating' | null>(null);

  const [selectedViewerDoc, setSelectedViewerDoc] = useState<ResourceModel | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  const scrollToBottom = (force = false) => {
    if (force || !userScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFeedScroll = () => {
    if (!feedContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = feedContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setUserScrolledUp(!isNearBottom);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isLoading]);

  // 1. Restore persistent active conversation when scope changes or on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const conv = await ConversationService.getActiveConversation('usr_local', scopeType, scopeId);
        if (isMounted && conv) {
          setConversationId(conv.id);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_ACTIVE_CONV, conv.id);
          }
          if (conv.messages) {
            setMessages(conv.messages);
          }
        }
      } catch (err) {
        console.warn('Failed to restore assistant conversation:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [scopeType, scopeId]);

  // 2. Synchronize with global active AI job if user navigated away and came back
  useEffect(() => {
    if (activeAiJob && activeAiJob.status === 'completed' && activeAiJob.answer) {
      const alreadyPresent = messages.some((m) => m.content === activeAiJob.answer);
      if (!alreadyPresent) {
        const assistantMsg: AssistantMessageModel = {
          id: `msg_${Date.now()}_sync`,
          conversation_id: conversationId,
          user_id: 'usr_local',
          role: 'assistant',
          content: activeAiJob.answer,
          citations: activeAiJob.citations || [],
          used_resource_ids: [],
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
      setIsLoading(false);
      clearAiJob();
    }
  }, [activeAiJob, conversationId, messages, clearAiJob]);

  const handleResetConversation = async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      await ConversationService.resetConversation(conversationId);
      setMessages([]);
      setStreamingContent('');
      setStreamingCitations([]);
      setIsLoading(false);
      showToast('Research conversation reset');
    } catch {
      setMessages([]);
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    if (streamingContent) {
      const partialMsg: AssistantMessageModel = {
        id: `msg_${Date.now()}_partial`,
        conversation_id: conversationId,
        user_id: 'usr_local',
        role: 'assistant',
        content: streamingContent + ' *(Generation stopped by user)*',
        citations: streamingCitations,
        used_resource_ids: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, partialMsg]);
    }
    setStreamingContent('');
    setStreamingCitations([]);
    setStreamingStatus(null);
  };

  const handleSend = async (userPrompt?: string) => {
    const text = (userPrompt || query).trim();
    if (!text || isLoading) return;

    const userMessage: AssistantMessageModel = {
      id: `msg_${Date.now()}_u`,
      conversation_id: conversationId,
      user_id: 'usr_local',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);
    setStreamingContent('');
    setStreamingCitations([]);
    setStreamingStatus('retrieving');

    const activeController = new AbortController();
    abortControllerRef.current = activeController;

    try {
      const response = await fetch('/api/assistant/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          scopeType,
          scopeId,
          conversationId,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: activeController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedTokens = '';
      let receivedCitations: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n');
          let event = 'message';
          let data = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              event = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              data = line.slice(6);
            }
          }

          if (event === 'status') {
            setStreamingStatus(data as any);
          } else if (event === 'meta') {
            try {
              const meta = JSON.parse(data);
              if (meta.citations) {
                receivedCitations = meta.citations;
                setStreamingCitations(meta.citations);
              }
            } catch {}
          } else if (event === 'token') {
            accumulatedTokens += data;
            setStreamingContent(accumulatedTokens);
          } else if (event === 'done') {
            try {
              const d = JSON.parse(data);
              const assistantMessage: AssistantMessageModel = {
                id: d.messageId || `msg_${Date.now()}_a`,
                conversation_id: conversationId,
                user_id: 'usr_local',
                role: 'assistant',
                content: d.fullAnswer || accumulatedTokens,
                citations: receivedCitations,
                used_resource_ids: [],
                created_at: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, assistantMessage]);
              setStreamingContent('');
              setStreamingCitations([]);
              setStreamingStatus(null);
              setIsLoading(false);
              clearAiJob();
              return;
            } catch {}
          }
        }
      }

      if (accumulatedTokens) {
        const assistantMessage: AssistantMessageModel = {
          id: `msg_${Date.now()}_a`,
          conversation_id: conversationId,
          user_id: 'usr_local',
          role: 'assistant',
          content: accumulatedTokens,
          citations: receivedCitations,
          used_resource_ids: [],
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showToast('Streaming interrupted; using background processing');
      }
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      setStreamingCitations([]);
      setStreamingStatus(null);
    }
  };

  const getActiveScopeLabel = () => {
    if (scopeType === 'library') return 'Entire Research Library';
    if (scopeType === 'project') {
      const p = projects.find((x) => x.id === scopeId);
      return p ? `Project: ${p.name}` : 'Selected Project';
    }
    if (scopeType === 'collection') {
      const c = collections.find((x) => x.id === scopeId);
      return c ? `Collection: ${c.name}` : 'Selected Collection';
    }
    if (scopeType === 'document') return 'Selected Document';
    return 'Library';
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-4rem)] justify-between space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header & Scope Selector */}
      <PageHeader
        eyebrow="RESEARCH CONSOLE"
        eyebrowColor="violet"
        eyebrowIcon={<Sparkles className="w-3 h-3 stroke-[2.5]" />}
        title="ASK RESORA."
        description="A private research intelligence console grounded directly in your personal archive with verifiable citations."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={scopeType}
              onChange={(e) => {
                setScopeType(e.target.value as AssistantScopeType);
                setScopeId(undefined);
              }}
              className="px-3.5 py-2.5 bg-white border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000] focus:outline-none uppercase tracking-wider cursor-pointer"
            >
              <option value="library">SCOPE: ENTIRE LIBRARY</option>
              <option value="project">SCOPE: PROJECTS</option>
              <option value="collection">SCOPE: COLLECTIONS</option>
              <option value="document">SCOPE: DOCUMENTS ONLY</option>
            </select>

            {messages.length > 0 && (
              <button
                onClick={handleResetConversation}
                className="btn-neo flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-[#FF6B6B] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] transition-colors"
                title="Reset research conversation"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">RESET</span>
              </button>
            )}
          </div>
        }
      />

      <div className="space-y-4">
        {/* Active Scope Pill */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold">
          <span className="text-black/60 uppercase">Active Retrieval Grounding:</span>
          <span className="px-2 py-0.5 bg-[#FFD93D] border border-black text-black">
            {getActiveScopeLabel()}
          </span>
        </div>
      </div>

      {/* Message Feed / Grounded Conversation */}
      <div
        ref={feedContainerRef}
        onScroll={handleFeedScroll}
        className="flex-1 space-y-6 overflow-y-auto py-2 relative"
      >
        {messages.length === 0 ? (
          <div className="p-8 sm:p-12 bg-white border-3 border-black shadow-[6px_6px_0px_#000] text-center space-y-5">
            <div className="w-12 h-12 bg-[#FFD93D] border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000]">
              <Sparkles className="w-6 h-6 text-black stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase text-black">
                Your Research Console is Ready
              </h3>
              <p className="text-xs sm:text-sm text-black/75 max-w-md mx-auto font-normal">
                Ask natural questions across your saved websites, GitHub repositories, PDFs, and developer tools. Every answer includes verifiable sources and runs persistently in the background.
              </p>
            </div>

            {/* Suggested Prompts */}
            <div className="pt-3">
              <div className="text-[11px] font-mono font-bold text-black/60 uppercase mb-2.5">
                Try asking:
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="btn-neo text-xs text-black font-bold px-3 py-1.5 bg-[#FFFDF5] hover:bg-[#FFD93D] border-2 border-black shadow-[2px_2px_0px_#000]"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`space-y-3 ${isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}
              >
                {/* Message Header */}
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase">
                  <span
                    className={`px-2 py-0.5 border border-black ${
                      isUser ? 'bg-[#FFD93D] text-black' : 'bg-[#FF6B6B] text-black'
                    }`}
                  >
                    {isUser ? 'YOU' : 'RESORA AI'}
                  </span>
                  <span className="text-black/50">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Bubble Body */}
                <div
                  className={`p-4 sm:p-5 border-2 border-black text-xs sm:text-sm leading-relaxed max-w-2xl ${
                    isUser
                      ? 'bg-[#FFD93D] text-black font-bold shadow-[3px_3px_0px_#000]'
                      : 'bg-white text-black font-normal shadow-[4px_4px_0px_#000]'
                  }`}
                >
                  {isUser ? (
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  ) : (
                    <MarkdownRenderer content={m.content} />
                  )}
                </div>

                {/* Citations & Source Cards (Assistant Only) */}
                {!isUser && m.citations && m.citations.length > 0 && (
                  <div className="w-full max-w-2xl pt-2 space-y-2">
                    <div className="text-[11px] font-mono font-bold uppercase text-black/60">
                      Cited Sources ({m.citations.length}):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {m.citations.map((c, i) => (
                        <SourceCard
                          key={i}
                          citation={c}
                          index={i + 1}
                          onOpenDocumentPage={(resId) => {
                            const found = resources.find((r) => r.id === resId);
                            if (found) setSelectedViewerDoc(found);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Live Streaming Response Bubble */}
        {isLoading && (
          <div className="space-y-3 flex flex-col items-start animate-in fade-in duration-100">
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase">
              <span className="px-2 py-0.5 border border-black bg-[#FF6B6B] text-black">
                RESORA AI
              </span>
              <span className="text-black/60 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin stroke-[2.5]" />
                {streamingStatus === 'retrieving' ? 'Retrieving library context...' : 'Streaming response...'}
              </span>
            </div>

            {streamingContent ? (
              <div className="p-4 sm:p-5 border-2 border-black text-xs sm:text-sm leading-relaxed max-w-2xl bg-white text-black font-normal shadow-[4px_4px_0px_#000]">
                <MarkdownRenderer content={streamingContent} />
                <span className="inline-block w-2 h-4 ml-1 bg-black animate-pulse align-middle" />
              </div>
            ) : (
              <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#000] w-max flex items-center gap-2.5 text-xs font-bold text-black">
                <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                <span>Resora is synthesizing your saved research... (Safe to navigate away)</span>
              </div>
            )}

            {/* Citations arrived during stream */}
            {streamingCitations.length > 0 && (
              <div className="w-full max-w-2xl pt-2 space-y-2">
                <div className="text-[11px] font-mono font-bold uppercase text-black/60">
                  Cited Sources ({streamingCitations.length}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {streamingCitations.map((c, i) => (
                    <SourceCard
                      key={i}
                      citation={c}
                      index={i + 1}
                      onOpenDocumentPage={(resId) => {
                        const found = resources.find((r) => r.id === resId);
                        if (found) setSelectedViewerDoc(found);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {userScrolledUp && (
          <div className="sticky bottom-2 flex justify-center z-20 pointer-events-none">
            <button
              onClick={() => {
                setUserScrolledUp(false);
                scrollToBottom(true);
              }}
              className="pointer-events-auto btn-neo px-3 py-1.5 bg-[#FFD93D] hover:bg-[#ffe169] text-black border-2 border-black text-[11px] font-black uppercase shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5"
            >
              ↓ Jump to latest
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer Input Bar */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center bg-white border-3 border-black shadow-[5px_5px_0px_#000]"
        >
          <input
            type="text"
            placeholder="Ask anything about your saved research..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3.5 bg-transparent text-black text-xs sm:text-sm font-normal focus:outline-none placeholder-black/50"
          />

          {isLoading ? (
            <button
              type="button"
              onClick={handleStopGenerating}
              className="btn-neo m-1.5 px-4 py-2 bg-[#FFD93D] hover:bg-[#ffe169] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
            >
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!query.trim()}
              className="btn-neo m-1.5 px-4 py-2 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </form>
      </div>

      {/* Document Viewer Modal if citation opened */}
      <DocumentViewerModal
        isOpen={Boolean(selectedViewerDoc)}
        resource={selectedViewerDoc}
        onClose={() => setSelectedViewerDoc(null)}
      />
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
      <AssistantContent />
    </Suspense>
  );
}
