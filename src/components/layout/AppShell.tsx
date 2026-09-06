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
    <div className="min-h-screen bg-[#FFFDF5] text-[#000000] flex flex-col antialiased selection:bg-[#FFD93D] selection:text-[#000000]">
      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#FFD93D] border-4 border-black text-black shadow-[6px_6px_0px_0px_#000] animate-in slide-in-from-bottom-3 duration-100 text-xs font-black uppercase">
          <CheckCircle2 className="w-4 h-4 text-black shrink-0 stroke-[3]" />
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
      <header className="h-16 border-b-4 border-black bg-[#FFFFFF] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-[0px_4px_0px_0px_#000]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-[#FFD93D] border-4 border-black shadow-[3px_3px_0px_0px_#000] text-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 stroke-[3]" /> : <Menu className="w-5 h-5 stroke-[3]" />}
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
            className="flex items-center gap-2.5 px-3.5 py-2 bg-[#FFFDF5] hover:bg-[#FFD93D] border-4 border-black shadow-[4px_4px_0px_0px_#000] text-xs font-black uppercase tracking-wider text-black w-44 sm:w-72 justify-between group transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-black shrink-0 stroke-[3]" />
              <span className="truncate">Search library...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center font-mono text-[10px] bg-black text-white px-1.5 py-0.5 font-black">
              ⌘K
            </kbd>
          </button>

          {/* Quick Add Resource: Hot Red Primary */}
          <button
            onClick={openSaveModal}
            className="btn-neo flex items-center gap-1.5 px-4 py-2 bg-[#FF6B6B] text-black font-black uppercase text-xs tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Capture</span>
          </button>

          {/* User Profile Badge: Vivid Yellow Sticker */}
          <div className="w-9 h-9 rounded-full bg-[#FFD93D] border-4 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center text-black text-xs font-black select-none">
            A
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar: Thick Black Border */}
        <aside className="hidden md:flex w-64 flex-col justify-between border-r-4 border-black bg-[#FFFFFF] shrink-0 p-4">
          <div className="space-y-4">
            {/* Sidebar Brand Header */}
            <div className="pb-3 border-b-4 border-black">
              <Link
                href="/app"
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                title="Resora — Personal Research Intelligence"
              >
                <ResoraLogo size="sm" variant="compact" />
              </Link>
            </div>

            <div className="px-2 text-[11px] font-black uppercase tracking-widest text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#FF6B6B] border-2 border-black rotate-45"></span>
              Research Index
            </div>

            <div className="space-y-1.5">
              {navItems.map((item) => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 text-xs font-black uppercase tracking-wider transition-all border-4 ${
                      active
                        ? 'bg-[#FF6B6B] text-black border-black shadow-[4px_4px_0px_0px_#000] -rotate-1'
                        : 'bg-white text-black border-transparent hover:border-black hover:bg-[#FFD93D] hover:shadow-[3px_3px_0px_0px_#000]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 stroke-[3]" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-mono font-black border-2 border-black ${
                          active
                            ? 'bg-[#FFD93D] text-black'
                            : 'bg-[#C4B5FD] text-black'
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
          <div className="pt-3 border-t-4 border-black space-y-3">
            <div className="px-2 text-[11px] font-black uppercase tracking-widest text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#C4B5FD] border-2 border-black"></span>
              System
            </div>
            {bottomNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-black uppercase tracking-wider transition-all border-4 ${
                    active
                      ? 'bg-[#FFD93D] text-black border-black shadow-[4px_4px_0px_0px_#000]'
                      : 'bg-white text-black border-transparent hover:border-black hover:bg-[#FFFDF5]'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[3]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="p-3 bg-[#FFFDF5] border-4 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between text-xs">
              <div className="truncate">
                <div className="font-black text-black uppercase tracking-wider truncate">Ashwin</div>
                <div className="text-[10px] text-black/70 font-mono font-bold">Local Workspace</div>
              </div>
              <span className="w-3 h-3 rounded-full bg-[#FFD93D] border-2 border-black" title="Connected"></span>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-out Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-72 max-w-[85vw] bg-[#FFFDF5] border-r-4 border-black p-4 flex flex-col justify-between z-10 shadow-[8px_0px_0px_0px_#000]">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b-4 border-black">
                  <ResoraLogo size="sm" variant="compact" />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 border-4 border-black bg-[#FFD93D]"
                  >
                    <X className="w-5 h-5 stroke-[3]" />
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
                      className={`flex items-center justify-between px-3 py-2 text-xs font-black uppercase tracking-wider border-4 border-black ${
                        active
                          ? 'bg-[#FF6B6B] text-black shadow-[4px_4px_0px_0px_#000]'
                          : 'bg-white text-black hover:bg-[#FFD93D]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 stroke-[3]" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-black bg-[#FFD93D] text-black border-2 border-black">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-3 border-t-4 border-black">
                {bottomNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-black uppercase tracking-wider text-black border-4 border-black bg-white hover:bg-[#FFD93D]"
                    >
                      <Icon className="w-4 h-4 stroke-[3]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-[#FFFDF5]">
          {children}
        </main>
      </div>
    </div>
  );
}
