'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { SourceCard } from '@/components/assistant/SourceCard';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import {
  AssistantScopeType,
  AssistantMessageModel,
  AssistantCitation,
  ResourceModel
} from '@/types/database';
import {
  Sparkles,
  Send,
  Loader2,
  Bookmark,
  Layers,
  FileText,
  Wrench,
  Heart,
  RotateCcw,
  ArrowRight,
  Info,
  ChevronDown
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What AI coding tools did I save?',
  'Where did I save information about AI agent memory?',
  'Compare Supabase and Firebase based on my research.',
  'What resources can help with my hackathon build?',
  'What PDFs contain information about compound systems?',
  'Show me my best developer tools.',
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

  // Document Reader preview modal
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
      showToast('Resora Assistant could not complete the request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDocPage = (resourceId: string, pageNumber: number) => {
    const docRes = resources.find((r) => r.id === resourceId);
    if (docRes) {
      setSelectedViewerDoc(docRes);
    }
  };

  // Scope label generator
  const getScopeName = () => {
    if (scopeType === 'project' && scopeId) {
      const p = projects.find((proj) => proj.id === scopeId);
      return p ? `Project: ${p.name}` : 'Current Project';
    }
    if (scopeType === 'collection' && scopeId) {
      const c = collections.find((col) => col.id === scopeId);
      return c ? `Collection: ${c.name}` : 'Current Collection';
    }
    if (scopeType === 'documents') return 'Documents Only';
    if (scopeType === 'tools') return 'Developer Tools';
    if (scopeType === 'favorites') return 'Favorites Only';
    return 'Entire Library';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#090a10] text-slate-100 animate-in fade-in duration-150">
      {/* Top Scope & Controls Header */}
      <div className="h-14 border-b border-[#1b2031] px-4 sm:px-8 flex items-center justify-between bg-[#0d0f18]/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-slate-100">Ask Resora</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                AI Research Assistant
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Grounded answers strictly from your saved research and documents.
            </p>
          </div>
        </div>

        {/* Scope Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-mono text-slate-400 hidden sm:inline">Scope:</label>
          <select
            value={scopeType}
            onChange={(e) => {
              setScopeType(e.target.value as AssistantScopeType);
              if (e.target.value === 'library' || e.target.value === 'documents' || e.target.value === 'tools' || e.target.value === 'favorites') {
                setScopeId(undefined);
              }
            }}
            className="rounded-lg bg-[#141825] border border-[#23293c] px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
          >
            <option value="library">Entire Library</option>
            <option value="documents">Documents & PDFs</option>
            <option value="tools">Developer Tools</option>
            <option value="favorites">Favorites Only</option>
            {projects.map((p) => (
              <option key={p.id} value="project">
                Project: {p.name}
              </option>
            ))}
          </select>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="p-1.5 rounded-lg border border-[#22283a] text-slate-400 hover:text-slate-200 hover:bg-[#151928] transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="py-12 text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-base font-semibold text-slate-100">
                Search, synthesize, and leverage your research
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ask questions across your saved resources. Resora retrieves relevant context, references document pages, and provides fact-grounded synthesis without hallucinating.
              </p>
            </div>

            {/* Clickable Suggested Queries */}
            <div className="pt-2 max-w-2xl mx-auto">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-3">
                Suggested Questions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="p-3 rounded-xl bg-[#121420] hover:bg-[#161a29] border border-[#1e2335] hover:border-indigo-500/40 text-xs text-slate-300 hover:text-slate-100 transition-all flex items-center justify-between group shadow-sm"
                  >
                    <span className="truncate pr-2">{q}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 shrink-0 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`space-y-3 ${msg.role === 'user' ? 'pl-8 sm:pl-16' : 'pr-8 sm:pr-16'}`}
            >
              <div
                className={`p-4 sm:p-5 rounded-2xl border leading-relaxed text-xs sm:text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-slate-100 ml-auto'
                    : 'bg-[#12141f] border-[#202538] text-slate-200'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-400 font-medium mb-2.5 pb-2 border-b border-[#1c2234]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Resora Assistant · {getScopeName()}</span>
                  </div>
                )}
                <div className="font-sans leading-relaxed">{msg.content}</div>
              </div>

              {/* Citations & Source Cards Shelf */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-1 space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Sources Cited ({msg.citations.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {msg.citations.map((cite, i) => (
                      <SourceCard
                        key={i}
                        citation={cite}
                        index={i}
                        onOpenDocumentPage={handleOpenDocPage}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="p-4 rounded-2xl bg-[#12141f] border border-[#202538] flex items-center gap-3 text-xs text-slate-400 animate-pulse">
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>Searching your library and synthesizing grounded answer...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer Input Bar */}
      <div className="p-4 sm:p-6 border-t border-[#1b2031] bg-[#0c0e17] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto relative"
        >
          <div className="flex items-center rounded-2xl bg-[#141725] border border-[#242b3e] focus-within:border-indigo-500 shadow-xl transition-colors pl-4 pr-2 py-2">
            <input
              type="text"
              autoFocus
              placeholder={`Ask anything about your saved research in ${getScopeName()}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-xs sm:text-sm"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 shrink-0 ml-2"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Document Reader Modal */}
      {selectedViewerDoc && (
        <DocumentViewerModal
          resource={selectedViewerDoc}
          isOpen={!!selectedViewerDoc}
          onClose={() => setSelectedViewerDoc(null)}
        />
      )}
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <span className="text-sm font-medium">Loading Resora Assistant...</span>
        </div>
      </div>
    }>
      <AssistantContent />
    </Suspense>
  );
}
