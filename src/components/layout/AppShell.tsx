'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { ResoraLogo } from '@/components/brand/ResoraLogo';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { SaveResourceDialog } from '@/components/resources/SaveResourceDialog';
import { EditResourceDialog } from '@/components/resources/EditResourceDialog';
import { DeleteResourceDialog } from '@/components/resources/DeleteResourceDialog';
import {
  Home,
  Inbox,
  Library,
  FolderKanban,
  Bookmark,
  FileText,
  Wrench,
  Heart,
  Settings,
  Search,
  Plus,
  Menu,
  X,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const {
    openCommandPalette,
    openSaveModal,
    editingResource,
    closeEditModal,
    updateResource,
    deletingResource,
    closeDeleteDialog,
    deleteResource,
    metrics,
    activeToast
  } = useResora();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/app', icon: Home, exact: true },
    { label: 'Ask Resora', href: '/app/assistant', icon: Sparkles },
    { label: 'Inbox', href: '/app/inbox', icon: Inbox, badge: metrics.inbox },
    { label: 'Library', href: '/app/library', icon: Library },
    { label: 'Projects', href: '/app/projects', icon: FolderKanban, badge: metrics.projects },
    { label: 'Collections', href: '/app/collections', icon: Bookmark, badge: metrics.collections },
    { label: 'Documents', href: '/app/documents', icon: FileText, badge: metrics.documents },
    { label: 'Tools', href: '/app/tools', icon: Wrench },
    { label: 'Favorites', href: '/app/favorites', icon: Heart, badge: metrics.favorites },
  ];

  const bottomNavItems = [
    { label: 'Settings', href: '/app/settings', icon: Settings },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col antialiased">
      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#181d2e] border border-indigo-500/40 text-slate-100 shadow-xl shadow-black/80 animate-in slide-in-from-bottom-3 duration-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{activeToast}</span>
        </div>
      )}

      {/* Global Dialogs */}
      <CommandPalette />
      <SaveResourceDialog />
      <EditResourceDialog
        isOpen={Boolean(editingResource)}
        resource={editingResource}
        onClose={closeEditModal}
        onSave={async (id, updates) => {
          await updateResource(id, updates);
        }}
      />
      <DeleteResourceDialog
        isOpen={Boolean(deletingResource)}
        resourceTitle={deletingResource?.title || ''}
        onConfirm={async () => {
          if (deletingResource) {
            await deleteResource(deletingResource.id);
            closeDeleteDialog();
          }
        }}
        onCancel={closeDeleteDialog}
      />

      {/* Top Header */}
      <header className="h-16 border-b-4 border-[#121212] bg-[#FFFFFF] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-[0px_4px_0px_0px_#121212]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-[#F0F0F0] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-[#121212] active:translate-x-0.5 active:translate-y-0.5"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/app" className="flex items-center">
            <ResoraLogo size="sm" variant="compact" />
          </Link>
        </div>

        {/* Global Search & Actions */}
        <div className="flex items-center gap-3">
          {/* Global Search Trigger */}
          <button
            onClick={openCommandPalette}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-none bg-[#F0F0F0] hover:bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] text-xs font-bold uppercase tracking-wider text-[#121212] w-44 sm:w-72 justify-between group transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-[#1040C0] shrink-0" />
              <span className="truncate">Search research...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center font-mono text-[10px] bg-[#121212] text-[#FFFFFF] px-1.5 py-0.5 font-bold">
              ⌘K
            </kbd>
          </button>

          {/* Quick Add Resource */}
          <button
            onClick={openSaveModal}
            className="btn-bauhaus flex items-center gap-1.5 px-3.5 py-2 rounded-none bg-[#D02020] text-[#FFFFFF] font-black uppercase text-xs tracking-wider border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Capture</span>
          </button>

          {/* User Profile Badge */}
          <div className="w-8 h-8 rounded-full bg-[#F0C020] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] flex items-center justify-center text-[#121212] text-xs font-black select-none">
            A
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col justify-between border-r-4 border-[#121212] bg-[#FFFFFF] shrink-0 p-4">
          <div className="space-y-4">
            {/* Sidebar Brand Header */}
            <div className="pb-3 border-b-2 border-[#121212]">
              <Link
                href="/app"
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                title="Resora — Personal Research Intelligence"
              >
                <ResoraLogo size="sm" variant="compact" />
              </Link>
            </div>

            <div className="px-2 text-[11px] font-black uppercase tracking-widest text-[#121212] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D02020] border border-[#121212]"></span>
              Navigation
            </div>

            <div className="space-y-1.5">
              {navItems.map((item) => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 text-xs font-black uppercase tracking-wider transition-all border-2 ${
                      active
                        ? 'bg-[#121212] text-[#FFFFFF] border-[#121212] shadow-[3px_3px_0px_0px_#D02020]'
                        : 'bg-[#FFFFFF] text-[#121212] border-transparent hover:border-[#121212] hover:bg-[#F0F0F0]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-[#F0C020]' : 'text-[#121212]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-mono font-bold border ${
                          active
                            ? 'bg-[#D02020] text-[#FFFFFF] border-[#FFFFFF]'
                            : 'bg-[#F0C020] text-[#121212] border-[#121212]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-3 border-t-2 border-[#121212] space-y-3">
            <div className="px-2 text-[11px] font-black uppercase tracking-widest text-[#121212] flex items-center gap-2">
              <span className="w-2 h-2 rounded-none bg-[#1040C0] border border-[#121212]"></span>
              Workspace
            </div>
            {bottomNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-black uppercase tracking-wider transition-all border-2 ${
                    active
                      ? 'bg-[#121212] text-[#FFFFFF] border-[#121212]'
                      : 'bg-[#FFFFFF] text-[#121212] border-transparent hover:border-[#121212] hover:bg-[#F0F0F0]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#121212]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="p-3 bg-[#F0F0F0] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex items-center justify-between text-xs">
              <div className="truncate">
                <div className="font-black text-[#121212] uppercase tracking-wider truncate">Ashwin</div>
                <div className="text-[10px] text-[#121212]/70 font-mono">Local Workspace</div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#1040C0] border border-[#121212]" title="Connected"></span>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-out Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-[#121212]/80 backdrop-blur-none" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-64 max-w-[80vw] bg-[#FFFFFF] border-r-4 border-[#121212] p-4 flex flex-col justify-between z-10">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#121212]">
                  <ResoraLogo size="sm" variant="compact" />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 border-2 border-[#121212] bg-[#F0F0F0]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {navItems.map((item) => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-xs font-black uppercase tracking-wider border-2 ${
                        active
                          ? 'bg-[#121212] text-[#FFFFFF] border-[#121212]'
                          : 'bg-[#FFFFFF] text-[#121212] border-transparent hover:border-[#121212]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#F0C020] text-[#121212] border border-[#121212]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-3 border-t-2 border-[#121212]">
                {bottomNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-black uppercase tracking-wider text-[#121212] border-2 border-transparent hover:border-[#121212]"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-[#F0F0F0]">
          {children}
        </main>
      </div>
    </div>
  );
}
