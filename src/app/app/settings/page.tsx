'use client';

import React, { useState, useRef } from 'react';
import { useResora } from '@/context/ResoraContext';
import { AuthService } from '@/lib/auth/auth-service';
import { PageHeader } from '@/components/ui/SectionLabel';
import {
  User,
  Sliders,
  Database,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  Save,
  LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const { showToast, resources, projects, collections, cleanAllDuplicates, user } = useResora();

  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'data'>('profile');
  const [name, setName] = useState(user?.name || 'Researcher');
  const [email, setEmail] = useState(user?.email || '');
  const [defaultView, setDefaultView] = useState('grid');
  const [defaultScope, setDefaultScope] = useState('library');

  // Update when user loads
  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Import file ref
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await AuthService.updateProfile({ name, email });
    showToast('Profile updated successfully');
  };

  const handleExportJson = () => {
    const exportBundle = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      user: { name, email },
      summary: {
        total_resources: resources.length,
        total_projects: projects.length,
        total_collections: collections.length,
      },
      resources,
      projects,
      collections,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `resora_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${resources.length} resources as JSON`);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Title', 'URL', 'Domain', 'Type', 'Favorite', 'Tags', 'Use Cases', 'Created At'];
    const rows = resources.map((r) => [
      `"${r.id}"`,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${r.url}"`,
      `"${r.domain}"`,
      `"${r.resource_type}"`,
      r.is_favorite ? 'true' : 'false',
      `"${(r.tags || []).join(', ')}"`,
      `"${(r.use_cases || []).join(', ')}"`,
      `"${r.created_at}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `resora_resources_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${resources.length} resources as CSV`);
  };

  const handleBookmarkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const html = event.target?.result as string;
      const linkRegex = /<A\s+(?:[^>]*?\s+)?HREF="([^"]*)"[^>]*>(.*?)<\/A>/gi;
      let match;
      let importedCount = 0;
      let skippedDuplicates = 0;

      const existingUrls = new Set(resources.map((r) => r.url.toLowerCase()));

      while ((match = linkRegex.exec(html)) !== null) {
        const url = match[1].trim();
        if (url.startsWith('http://') || url.startsWith('https://')) {
          if (existingUrls.has(url.toLowerCase())) {
            skippedDuplicates++;
          } else {
            importedCount++;
          }
        }
      }

      showToast(`Imported ${importedCount} bookmarks (${skippedDuplicates} duplicates skipped)`);
      if (importInputRef.current) importInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    localStorage.clear();
    await AuthService.signOut();
    window.location.href = '/';
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <PageHeader
        eyebrow="SYSTEM & CONTROL"
        eyebrowColor="white"
        eyebrowIcon={<Sliders className="w-3 h-3 stroke-[2.5]" />}
        title="SETTINGS & PREFERENCES."
        description="Manage your research profile, workspace configurations, and data export portability."
        actions={
          <button
            onClick={async () => {
              await AuthService.signOut();
              window.location.href = '/auth';
            }}
            className="btn-neo flex items-center gap-2 px-5 py-3 bg-white border-2 border-black text-black font-black uppercase text-xs md:text-sm tracking-wider shadow-[3px_3px_0px_#000]"
          >
            <LogOut className="w-4 h-4 stroke-[3px]" />
            <span>SIGN OUT</span>
          </button>
        }
      />

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-3 border-b-4 border-black pb-4 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`btn-neo flex items-center gap-2 px-4 py-2.5 rounded-none border-2 border-black font-black uppercase tracking-wider transition-all ${
            activeTab === 'profile'
              ? 'bg-[#FFD93D] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <User className="w-4 h-4 stroke-[3px]" />
          <span>PROFILE & ACCOUNT</span>
        </button>
        <button
          onClick={() => setActiveTab('workspace')}
          className={`btn-neo flex items-center gap-2 px-4 py-2.5 rounded-none border-2 border-black font-black uppercase tracking-wider transition-all ${
            activeTab === 'workspace'
              ? 'bg-[#C4B5FD] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <Sliders className="w-4 h-4 stroke-[3px]" />
          <span>WORKSPACE</span>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`btn-neo flex items-center gap-2 px-4 py-2.5 rounded-none border-2 border-black font-black uppercase tracking-wider transition-all ${
            activeTab === 'data'
              ? 'bg-[#FF6B6B] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <Database className="w-4 h-4 stroke-[3px]" />
          <span>DATA PORTABILITY</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-5 max-w-xl text-xs">
          <div className="p-6 md:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-4">
            <div>
              <label className="block text-black font-black uppercase text-xs mb-1.5">DISPLAY NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3.5 py-3 text-black font-black uppercase focus:bg-[#FFD93D] focus:outline-none shadow-[3px_3px_0px_0px_#000]"
              />
            </div>

            <div>
              <label className="block text-black font-black uppercase text-xs mb-1.5">EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3.5 py-3 text-black font-mono font-bold focus:bg-[#FFD93D] focus:outline-none shadow-[3px_3px_0px_0px_#000]"
              />
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3 border-t-2 border-black/10">
              <button
                type="submit"
                className="btn-neo flex items-center gap-2 px-6 py-3.5 bg-[#FFD93D] hover:bg-[#ffe169] text-black font-black uppercase text-xs md:text-sm tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000]"
              >
                <Save className="w-4 h-4 stroke-[3px]" />
                <span>SAVE PROFILE</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await AuthService.signOut();
                  window.location.href = '/auth';
                }}
                className="btn-neo flex items-center gap-2 px-6 py-3.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs md:text-sm tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000]"
              >
                <LogOut className="w-4 h-4 stroke-[3px]" />
                <span>SIGN OUT OF RESORA</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'workspace' && (
        <div className="space-y-5 max-w-xl text-xs">
          <div className="p-6 md:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-2.5">
            <div className="font-black uppercase text-sm md:text-base text-black bg-[#FFD93D] px-2 py-0.5 border border-black w-max">
              DEFAULT LIBRARY VIEW
            </div>
            <p className="text-black text-xs font-bold">Choose whether the research library opens in grid cards or list mode.</p>
            <select
              value={defaultView}
              onChange={(e) => {
                setDefaultView(e.target.value);
                showToast(`Default view updated to ${e.target.value}`);
              }}
              className="px-3.5 py-2.5 rounded-none bg-[#FFFDF5] border-4 border-black font-black uppercase text-black focus:bg-[#FFD93D] focus:outline-none shadow-[3px_3px_0px_0px_#000] mt-2 block w-full sm:w-auto"
            >
              <option value="grid">GRID (PHYSICAL RESEARCH INDEX CARDS)</option>
              <option value="list">LIST (LINEAR DOSSIER ROWS)</option>
            </select>
          </div>

          <div className="p-6 md:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-2.5">
            <div className="font-black uppercase text-sm md:text-base text-black bg-[#C4B5FD] px-2 py-0.5 border border-black w-max">
              DEFAULT ASSISTANT SCOPE
            </div>
            <p className="text-black text-xs font-bold">Primary grounding scope when launching Ask Resora.</p>
            <select
              value={defaultScope}
              onChange={(e) => {
                setDefaultScope(e.target.value);
                showToast(`Default assistant scope set to ${e.target.value}`);
              }}
              className="px-3.5 py-2.5 rounded-none bg-[#FFFDF5] border-4 border-black font-black uppercase text-black focus:bg-[#FFD93D] focus:outline-none shadow-[3px_3px_0px_0px_#000] mt-2 block w-full sm:w-auto"
            >
              <option value="library">ENTIRE LIBRARY</option>
              <option value="documents">DOCUMENTS ONLY</option>
              <option value="tools">DEVELOPER TOOLS</option>
              <option value="favorites">FAVORITES ONLY</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-6 max-w-xl text-xs">
          {/* Data Export */}
          <div className="p-6 md:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-3">
            <div>
              <div className="font-black uppercase text-sm md:text-base text-black bg-[#FFD93D] px-2 py-0.5 border border-black w-max">
                EXPORT RESEARCH DATA
              </div>
              <p className="text-black text-xs font-bold mt-2">
                Download your entire structured research library, including tags, use cases, and project links.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                onClick={handleExportJson}
                className="btn-neo flex items-center gap-2 px-5 py-3 bg-white border-4 border-black text-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_#000]"
              >
                <Download className="w-4 h-4 text-black stroke-[3px]" />
                <span>EXPORT JSON ({resources.length})</span>
              </button>
              <button
                onClick={handleExportCsv}
                className="btn-neo flex items-center gap-2 px-5 py-3 bg-white border-4 border-black text-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_#000]"
              >
                <FileSpreadsheet className="w-4 h-4 text-black stroke-[3px]" />
                <span>EXPORT CSV</span>
              </button>
            </div>
          </div>

          {/* Central Deduplication Engine Sweep */}
          <div className="p-6 md:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-3">
            <div>
              <div className="font-black uppercase text-sm md:text-base text-black bg-[#FFD93D] px-2 py-0.5 border border-black w-max">
                CLEAN & DEDUPLICATE LIBRARY
              </div>
              <p className="text-black text-xs font-bold mt-2">
                Scan all resources, merge duplicates, and ensure strict 1-to-1 canonical URLs across your workspace.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={async () => {
                  await cleanAllDuplicates();
                }}
                className="btn-neo inline-flex items-center gap-2 px-5 py-3 bg-[#FFD93D] hover:bg-[#ffe169] text-black border-4 border-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_#000]"
              >
                <span>RUN GLOBAL DEDUPLICATION SWEEP</span>
              </button>
            </div>
          </div>

          {/* Bookmark Import */}
          <div className="p-6 md:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-3">
            <div>
              <div className="font-black uppercase text-sm md:text-base text-black bg-[#C4B5FD] px-2 py-0.5 border border-black w-max">
                IMPORT BROWSER BOOKMARKS
              </div>
              <p className="text-black text-xs font-bold mt-2">
                Upload a standard bookmarks HTML file from Chrome, Edge, Safari, or Firefox.
              </p>
            </div>
            <div className="pt-2">
              <input
                ref={importInputRef}
                type="file"
                accept=".html,.htm"
                onChange={handleBookmarkImport}
                className="hidden"
                id="bookmark-file-input"
              />
              <label
                htmlFor="bookmark-file-input"
                className="btn-neo cursor-pointer inline-flex items-center gap-2 px-5 py-3 bg-[#FFD93D] hover:bg-[#ffe169] text-black border-4 border-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_#000]"
              >
                <Upload className="w-4 h-4 stroke-[3px]" />
                <span>SELECT BOOKMARKS HTML</span>
              </label>
            </div>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="p-6 md:p-8 bg-[#FFFDF5] border-4 border-[#FF6B6B] shadow-[8px_8px_0px_0px_#000] space-y-3">
            <div>
              <div className="font-black uppercase text-sm md:text-base text-black bg-[#FF6B6B] px-2 py-0.5 border-2 border-black w-max">
                PERMANENT ACCOUNT DELETION
              </div>
              <p className="text-black text-xs font-bold mt-2">
                Permanently purge your account, saved research links, document dossiers, and embeddings.
              </p>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn-neo flex items-center gap-2 px-5 py-3 bg-[#FF6B6B] hover:bg-[#ff5252] text-black border-4 border-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_#000] mt-2"
            >
              <Trash2 className="w-4 h-4 stroke-[3px]" />
              <span>DELETE ACCOUNT & DATA</span>
            </button>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-w-md w-full bg-white border-4 border-black rounded-none p-6 md:p-8 space-y-4 shadow-[12px_12px_0px_0px_#000]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF6B6B] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                <AlertTriangle className="w-6 h-6 text-black stroke-[2.5px]" />
              </div>
              <h2 className="text-lg font-black uppercase text-black leading-tight">DELETE ACCOUNT & ALL RESEARCH?</h2>
            </div>
            <p className="text-xs sm:text-sm font-medium text-black leading-relaxed">
              This action is <strong className="text-black bg-[#FF6B6B] px-1 border border-black uppercase font-black">irreversible</strong>. All your saved websites, PDF documents, project workspaces, decisions, and assistant threads will be permanently wiped.
            </p>
            <div>
              <label className="block text-xs font-black text-black mb-1.5 uppercase">
                TYPE <span className="font-mono bg-[#FFD93D] px-1.5 border border-black">DELETE</span> TO CONFIRM:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3.5 py-2.5 text-black font-mono font-black text-xs focus:bg-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirmText(''); }}
                className="btn-neo px-5 py-2.5 border-2 border-black bg-white text-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]"
              >
                CANCEL
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="btn-neo px-5 py-2.5 bg-[#FF6B6B] text-black border-4 border-black font-black text-xs uppercase disabled:opacity-50 shadow-[3px_3px_0px_0px_#000]"
              >
                PERMANENTLY DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
