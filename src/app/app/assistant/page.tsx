'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { SourceCard } from '@/components/assistant/SourceCard';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import { NeoSticker } from '@/components/brand/NeoSticker';
import {
  AssistantScopeType,
  AssistantMessageModel,
  ResourceModel
} from '@/types/database';
import {
  Send,
  Loader2,
  RotateCcw,
  ArrowRight,
  Info,
  Compass
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

  const getScopeName = () => {
    if (scopeType === 'project' && scopeId) {
      const p = projects.find((proj) => proj.id === scopeId);
      return p ? `PROJECT: ${p.name.toUpperCase()}` : 'CURRENT PROJECT';
    }
    if (scopeType === 'collection' && scopeId) {
      const c = collections.find((col) => col.id === scopeId);
      return c ? `COLLECTION: ${c.name.toUpperCase()}` : 'CURRENT COLLECTION';
    }
    if (scopeType === 'documents') return 'DOCUMENTS ONLY';
    if (scopeType === 'tools') return 'DEV TOOLS';
    if (scopeType === 'favorites') return 'FAVORITES ONLY';
    return 'ENTIRE LIBRARY';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#FFFDF5] text-black animate-in fade-in duration-100">
      {/* Top Scope & Controls Header */}
      <div className="h-16 border-b-4 border-black px-4 sm:px-8 flex items-center justify-between bg-white shrink-0 shadow-[0px_4px_0px_0px_#000] z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-none bg-[#FFD93D] border-4 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_#000]">
            <Compass className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black uppercase tracking-wider text-black">ASK RESORA</h1>
              <NeoSticker color="yellow" size="sm" rotate="-1">
                RESEARCH CONSOLE
              </NeoSticker>
            </div>
            <p className="text-[11px] font-black text-black/60 hidden sm:block">
              Synthesize factual answers grounded strictly in your personal indexed research.
            </p>
          </div>
        </div>

        {/* Scope Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-mono font-black text-black uppercase hidden sm:inline">SCOPE:</label>
          <select
            value={scopeType}
            onChange={(e) => {
              setScopeType(e.target.value as AssistantScopeType);
              if (e.target.value === 'library' || e.target.value === 'documents' || e.target.value === 'tools' || e.target.value === 'favorites') {
                setScopeId(undefined);
              }
            }}
            className="rounded-none bg-white border-4 border-black px-3 py-1.5 text-xs font-black uppercase text-black focus:outline-none cursor-pointer shadow-[3px_3px_0px_0px_#000]"
          >
            <option value="library">ENTIRE LIBRARY</option>
            <option value="documents">DOCUMENTS & PDFS</option>
            <option value="tools">DEV TOOLS</option>
            <option value="favorites">FAVORITES ONLY</option>
            {projects.map((p) => (
              <option key={p.id} value="project">
                PROJECT: {p.name.toUpperCase()}
              </option>
            ))}
          </select>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="btn-neo p-2 bg-white border-4 border-black text-black shadow-[3px_3px_0px_0px_#000]"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="py-8 text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <NeoSticker color="yellow" rotate="-2">FACTUAL</NeoSticker>
              <div className="w-12 h-12 rounded-none bg-[#FF6B6B] border-4 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center text-black font-black text-xs">
                RES
              </div>
              <NeoSticker color="violet" rotate="2">CITATIONS</NeoSticker>
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-black">
                QUERY YOUR COLLECTIVE RESEARCH
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/80 leading-relaxed">
                Query across your captured websites, documents, and tools. Resora retrieves relevant context, references page citations, and constructs verified answers.
              </p>
            </div>

            {/* Clickable Suggested Queries */}
            <div className="pt-4 max-w-2xl mx-auto">
              <div className="text-[11px] font-mono font-black uppercase tracking-wider text-black mb-3 text-left">
                SUGGESTED RESEARCH QUERIES:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="card-neo p-4 bg-white hover:bg-[#FFD93D] border-4 border-black shadow-[4px_4px_0px_0px_#000] text-xs font-black text-black transition-all flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">{q}</span>
                    <ArrowRight className="w-4 h-4 text-black stroke-[3] group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`space-y-3 ${msg.role === 'user' ? 'pl-6 sm:pl-16' : 'pr-6 sm:pr-16'}`}
            >
              <div
                className={`p-5 rounded-none border-4 border-black shadow-[6px_6px_0px_0px_#000] leading-relaxed text-xs sm:text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#FFD93D] text-black ml-auto'
                    : 'bg-white text-black'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 text-[11px] font-mono font-black text-black uppercase mb-3 pb-2 border-b-2 border-black">
                    <span className="w-2.5 h-2.5 bg-[#FF6B6B] border border-black" />
                    <span>RESORA RESEARCH DOSSIER · {getScopeName()}</span>
                  </div>
                )}
                <div className="font-bold leading-relaxed">{msg.content}</div>
              </div>

              {/* Citations Shelf */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 space-y-2">
                  <div className="text-[11px] font-mono font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-black stroke-[3]" />
                    <span>VERIFIED CITATIONS ({msg.citations.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
          <div className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] flex items-center gap-3 text-xs font-black uppercase text-black">
            <Loader2 className="w-4 h-4 text-black animate-spin stroke-[3]" />
            <span>SEARCHING RESEARCH INDEX AND SYNTHESIZING GROUNDED ANSWER...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer Input Bar: White Rectangle with 4px Black Border & Hard Shadow */}
      <div className="p-4 sm:p-6 border-t-4 border-black bg-white shrink-0 shadow-[0px_-4px_0px_0px_#000]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto relative"
        >
          <div className="flex items-center rounded-none bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-2 focus-within:bg-[#FFD93D] transition-colors">
            <input
              type="text"
              autoFocus
              placeholder={`ASK YOUR RESEARCH IN ${getScopeName()}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-transparent text-black placeholder-black/50 font-black uppercase focus:outline-none text-xs sm:text-sm"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="btn-neo px-6 py-3 rounded-none bg-[#FF6B6B] hover:bg-[#ff5252] text-black border-4 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000] disabled:opacity-50 shrink-0 ml-2"
              title="Send query"
            >
              <Send className="w-4 h-4 stroke-[3]" />
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
        <div className="text-sm font-black uppercase text-black">
          LOADING RESORA RESEARCH ASSISTANT...
        </div>
      </div>
    }>
      <AssistantContent />
    </Suspense>
  );
}
