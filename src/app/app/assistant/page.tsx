'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { SourceCard } from '@/components/assistant/SourceCard';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import {
  AssistantScopeType,
  AssistantMessageModel,
  ResourceModel
} from '@/types/database';
import { PageHeader, SectionLabel } from '@/components/ui/SectionLabel';
import {
  Send,
  Loader2,
  RotateCcw,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Plus
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What AI coding tools did I save?',
  'Compare Supabase and Firebase based on my research.',
  'What resources can help with my hackathon project?',
  'Summarize compound AI systems from my papers.',
];

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialScope = (searchParams.get('scope') as AssistantScopeType) || 'library';
  const initialScopeId = searchParams.get('scopeId') || undefined;

  const { resources, projects, collections, showToast } = useResora();

  const [scopeType, setScopeType] = useState<AssistantScopeType>(initialScope);
  const [scopeId, setScopeId] = useState<string | undefined>(initialScopeId);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<AssistantMessageModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedViewerDoc, setSelectedViewerDoc] = useState<ResourceModel | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (userPrompt?: string) => {
    const text = (userPrompt || query).trim();
    if (!text || isLoading) return;

    const userMessage: AssistantMessageModel = {
      id: `msg-${Date.now()}`,
      conversation_id: 'conv-active',
      user_id: 'usr_local',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          scopeType,
          scopeId,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error('Assistant query failed');
      }

      const data = await res.json();

      const assistantMessage: AssistantMessageModel = {
        id: `msg-${Date.now() + 1}`,
        conversation_id: 'conv-active',
        user_id: 'usr_local',
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        used_resource_ids: data.usedResourceIds || [],
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      showToast('Failed to get answer from Resora assistant');
    } finally {
      setIsLoading(false);
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
              className="px-3.5 py-2.5 bg-white border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000] focus:outline-none uppercase tracking-wider"
            >
              <option value="library">SCOPE: ENTIRE LIBRARY</option>
              <option value="project">SCOPE: PROJECTS</option>
              <option value="collection">SCOPE: COLLECTIONS</option>
              <option value="document">SCOPE: DOCUMENTS ONLY</option>
            </select>

            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
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
      <div className="flex-1 space-y-6 overflow-y-auto py-2">
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
                Ask natural questions across your saved websites, GitHub repositories, PDFs, and developer tools. Every answer includes verifiable sources.
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
                      : 'bg-white text-black font-normal shadow-[4px_4px_0px_#000] whitespace-pre-wrap'
                  }`}
                >
                  {m.content}
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

        {isLoading && (
          <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#000] w-max flex items-center gap-2.5 text-xs font-bold text-black">
            <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
            <span>Resora is synthesizing your saved research...</span>
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

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="btn-neo m-1.5 px-4 py-2 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 disabled:opacity-40"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
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
