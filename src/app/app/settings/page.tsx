'use client';

import React, { useState, useRef } from 'react';
import { useResora } from '@/context/ResoraContext';
import { AuthService } from '@/lib/auth/auth-service';
import {
  User,
  Shield,
  Database,
  Sliders,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Save,
  LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const { showToast, resources, projects, collections, refreshData } = useResora();
  const currentUser = AuthService.getCurrentUser();

  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'data'>('profile');
  const [name, setName] = useState(currentUser?.name || 'Ashwin');
  const [email, setEmail] = useState(currentUser?.email || 'ashwin@developer.local');
  const [defaultView, setDefaultView] = useState('grid');
  const [defaultScope, setDefaultScope] = useState('library');

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
      // Extract <A HREF="...">text</A> links
      const linkRegex = /<A\s+(?:[^>]*?\s+)?HREF="([^"]*)"[^>]*>(.*?)<\/A>/gi;
      let match;
      let importedCount = 0;
      let skippedDuplicates = 0;

      const existingUrls = new Set(resources.map((r) => r.url.toLowerCase()));

      while ((match = linkRegex.exec(html)) !== null) {
        const url = match[1].trim();
        const title = match[2].replace(/<[^>]*>?/gm, '').trim() || url;

        if (url.startsWith('http://') || url.startsWith('https://')) {
          if (existingUrls.has(url.toLowerCase())) {
            skippedDuplicates++;
          } else {
            // Import resource
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
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="pb-6 border-b border-[#1c2132] flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            Settings
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage your research profile, workspace preferences, and data portability.
          </p>
        </div>

        <button
          onClick={async () => {
            await AuthService.signOut();
            window.location.href = '/auth';
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151926] hover:bg-[#1f2538] text-slate-400 hover:text-slate-200 border border-[#242b3e] transition-colors text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1c2132] pb-3 text-xs font-medium">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'profile'
              ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile & Account</span>
        </button>
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'workspace'
              ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Workspace Preferences</span>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'data'
              ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Data Portability & Deletion</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-[#121420] border border-[#212638] px-3.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-[#121420] border border-[#212638] px-3.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-900/30 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'workspace' && (
        <div className="space-y-4 max-w-xl text-xs">
          <div className="p-4 rounded-xl bg-[#11131c] border border-[#1f2434] space-y-2">
            <div className="font-semibold text-slate-200">Default Library View</div>
            <p className="text-slate-400 text-[11px]">Choose whether the resource library opens in grid or list mode.</p>
            <select
              value={defaultView}
              onChange={(e) => {
                setDefaultView(e.target.value);
                showToast(`Default view updated to ${e.target.value}`);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#161925] border border-[#242a3e] text-slate-300 focus:outline-none"
            >
              <option value="grid">Grid (Compact dense cards)</option>
              <option value="list">List (Linear high-throughput table)</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-[#11131c] border border-[#1f2434] space-y-2">
            <div className="font-semibold text-slate-200">Default Assistant Scope</div>
            <p className="text-slate-400 text-[11px]">Primary grounding target when launching Ask Resora from global triggers.</p>
            <select
              value={defaultScope}
              onChange={(e) => {
                setDefaultScope(e.target.value);
                showToast(`Default assistant scope set to ${e.target.value}`);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#161925] border border-[#242a3e] text-slate-300 focus:outline-none"
            >
              <option value="library">Entire Library</option>
              <option value="documents">Documents Only</option>
              <option value="tools">Developer Tools</option>
              <option value="favorites">Favorites</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-[#11131c] border border-[#1f2434] space-y-2">
            <div className="font-semibold text-slate-200">Global Command Palette Shortcut</div>
            <p className="text-slate-400 text-[11px]">Primary keyboard shortcut to trigger research synthesis from any screen.</p>
            <div className="font-mono text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 inline-block">
              ⌘ + K / Ctrl + K
            </div>
          </div>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-4 max-w-xl text-xs">
          {/* Data Export */}
          <div className="p-4 rounded-xl bg-[#11131c] border border-[#1f2434] space-y-3">
            <div>
              <div className="font-semibold text-slate-200">Export Library Data</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Download your entire structured research database, including tags, use cases, and project links.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportJson}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#181d2a] hover:bg-[#202738] text-slate-200 border border-[#262d40] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export as JSON ({resources.length})</span>
              </button>
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#181d2a] hover:bg-[#202738] text-slate-200 border border-[#262d40] transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export as CSV</span>
              </button>
            </div>
          </div>

          {/* Bookmark Import */}
          <div className="p-4 rounded-xl bg-[#11131c] border border-[#1f2434] space-y-3">
            <div>
              <div className="font-semibold text-slate-200">Import Browser Bookmarks</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Upload a standard bookmarks HTML file from Chrome, Edge, Safari, or Firefox.
              </p>
            </div>
            <div>
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
                className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#181d2a] hover:bg-[#202738] text-slate-200 border border-[#262d40] transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Select Bookmarks HTML</span>
              </label>
            </div>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="p-4 rounded-xl bg-rose-950/10 border border-rose-900/30 space-y-3">
            <div>
              <div className="font-semibold text-rose-300">Permanent Account Deletion</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Permanently delete your Resora account, saved resources, extracted documents, conversations, and embeddings.
              </p>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account & Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-[#0f111a] border border-rose-900/40 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-base font-bold text-slate-100">Delete Account & All Research?</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This action is <strong className="text-rose-400">irreversible</strong>. All your saved websites, PDF documents, project workspaces, decisions, and assistant threads will be permanently wiped.
            </p>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Type <span className="font-mono text-rose-400 font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-xl bg-[#090a12] border border-[#282e44] px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirmText(''); }}
                className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs disabled:opacity-40 shadow-md shadow-rose-900/30 transition-all"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
