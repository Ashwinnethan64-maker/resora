'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Sparkles,
  Compass,
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { AuthService } from '@/lib/auth/auth-service';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    openCommandPalette,
    closeCommandPalette,
    isCommandPaletteOpen,
    openSaveModal,
    closeSaveModal,
    isSaveModalOpen,
    editingResource,
    closeEditModal,
    updateResource,
    deletingResource,
    closeDeleteDialog,
    deleteResource,
    metrics,
    resources,
    activeToast,
    activeAiJob,
    user,
  } = useResora();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const deletingChildCount = deletingResource
    ? resources.filter((r) => r.source_document_id === deletingResource.id).length
    : 0;

  interface NavItem {
    label: string;
    href: string;
    icon: any;
    exact?: boolean;
    accent?: string;
    badge?: number;
    badgeColor?: string;
  }

  const researchNavItems: NavItem[] = [
    { label: 'Home', href: '/app', icon: Home, exact: true },
    { label: 'Ask Resora', href: '/app/assistant', icon: Sparkles, accent: 'bg-[#FFD93D]' },
    { label: 'Inbox', href: '/app/inbox', icon: Inbox, badge: metrics.inbox, badgeColor: 'bg-[#FF6B6B]' },
    { label: 'Library', href: '/app/library', icon: Library },
  ];

  const workspaceNavItems: NavItem[] = [
    { label: 'Projects', href: '/app/projects', icon: FolderKanban, badge: metrics.projects, badgeColor: 'bg-[#FFD93D]' },
    { label: 'Collections', href: '/app/collections', icon: Bookmark, badge: metrics.collections, badgeColor: 'bg-[#C4B5FD]' },
  ];

  const knowledgeNavItems: NavItem[] = [
    { label: 'Documents', href: '/app/documents', icon: FileText, badge: metrics.documents, badgeColor: 'bg-[#C4B5FD]' },
    { label: 'Tools', href: '/app/tools', icon: Wrench },
    { label: 'Favorites', href: '/app/favorites', icon: Heart, badge: metrics.favorites, badgeColor: 'bg-[#FF6B6B]' },
  ];

  const bottomNavItems = [
    { label: 'Settings', href: '/app/settings', icon: Settings },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  // Global Quick Shortcuts (A, L, I, P, C, D, T, F, S) across the app when modal is closed
  React.useEffect(() => {
    const handleGlobalQuickKeys = (e: KeyboardEvent) => {
      // If modal or dialog is open, do nothing here (CommandPalette handles its own)
      if (isCommandPaletteOpen || isSaveModalOpen || editingResource || deletingResource) return;

      // Do not trigger if user is holding modifier keys
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Do not trigger if focus is in an input, textarea, select, or contenteditable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      switch (key) {
        case 'a':
          e.preventDefault();
          router.push('/app/assistant');
          break;
        case 'l':
          e.preventDefault();
          router.push('/app/library');
          break;
        case 'i':
          e.preventDefault();
          router.push('/app/inbox');
          break;
        case 'p':
          e.preventDefault();
          router.push('/app/projects');
          break;
        case 'c':
          e.preventDefault();
          router.push('/app/collections');
          break;
        case 'd':
          e.preventDefault();
          router.push('/app/documents');
          break;
        case 't':
          e.preventDefault();
          router.push('/app/tools');
          break;
        case 'f':
          e.preventDefault();
          router.push('/app/favorites');
          break;
        case 's':
          e.preventDefault();
          router.push('/app/settings');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleGlobalQuickKeys);
    return () => window.removeEventListener('keydown', handleGlobalQuickKeys);
  }, [router, isCommandPaletteOpen, isSaveModalOpen, editingResource, deletingResource]);

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black flex flex-col antialiased selection:bg-[#FFD93D] selection:text-black">
      {/* Toast Notification - Compact & Responsive */}
      {activeToast && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-between gap-2.5 px-3 py-2 bg-[#FFD93D] border-2 border-black text-black shadow-[3px_3px_0px_0px_#000] animate-in slide-in-from-bottom-2 duration-150 text-xs font-bold max-w-[90vw] sm:max-w-sm">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 stroke-[3]" />
            <span className="truncate font-mono uppercase text-[11px]">{activeToast}</span>
          </div>
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
        childCount={deletingChildCount}
        onConfirm={async () => {
          if (deletingResource) {
            const targetId = deletingResource.id;
            closeDeleteDialog();
            if (pathname.includes(targetId)) {
              router.push('/app/library');
            }
            await deleteResource(targetId);
          }
        }}
        onCancel={closeDeleteDialog}
      />

      {/* Top Header Command Bar */}
      <header className="h-16 border-b-3 border-black bg-white sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-[0px_2px_0px_0px_#000]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-[#FFD93D] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black active:translate-x-0.5 active:translate-y-0.5"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
          </button>
          
          <Link href="/app" className="flex items-center">
            <ResoraLogo size="sm" variant="compact" />
          </Link>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l-2 border-black/20 text-xs font-bold text-black/60">
            <span className="font-mono text-[11px] uppercase tracking-wider bg-[#FFFDF5] px-2 py-0.5 border border-black text-black font-black">
              RESEARCH INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Global Search & Command Actions */}
        <div className="flex items-center gap-3">
          {/* Global AI Processing Indicator */}
          {activeAiJob && (
            <Link
              href="/app/assistant"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FFD93D] border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase tracking-wider hover:bg-[#ffe169] transition-all"
              title="AI synthesis active - click to open Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-black stroke-[2.5] animate-spin" />
              <span className="hidden sm:inline">AI RUNNING:</span>
              <span className="truncate max-w-[100px] md:max-w-[140px] font-mono lowercase">
                {activeAiJob.query}
              </span>
            </Link>
          )}

          {/* Command Palette Search Trigger */}
          <button
            onClick={openCommandPalette}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-[#FFFDF5] hover:bg-[#FFD93D] border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-bold text-black w-36 sm:w-60 md:w-72 justify-between transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-black shrink-0 stroke-[2.5]" />
              <span className="truncate text-black/80 font-bold">Search...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center font-mono text-[10px] bg-black text-white px-1.5 py-0.5 font-bold">
              ⌘K
            </kbd>
          </button>

          {/* Quick Capture Resource CTA */}
          {/* User Profile Badge & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              aria-label="User profile menu"
              className="flex items-center gap-1 p-0.5 border-2 border-black bg-white hover:bg-[#FFD93D] shadow-[2px_2px_0px_0px_#000] transition-colors"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-7 h-7 object-cover border border-black"
                />
              ) : (
                <div className="w-7 h-7 bg-[#FFD93D] border border-black flex items-center justify-center text-black text-xs font-black select-none uppercase">
                  {(user?.name || 'A')[0]}
                </div>
              )}
              <ChevronDown className="w-3 h-3 text-black stroke-[3px] mr-0.5" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-3 z-50 animate-in fade-in duration-100 space-y-2.5">
                  <div className="pb-2 border-b-2 border-black">
                    <div className="text-xs font-black uppercase text-black truncate">
                      {user?.name || 'Researcher'}
                    </div>
                    <div className="text-[10px] font-mono font-bold text-black/70 truncate">
                      {user?.email || 'authenticated'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/app/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-black hover:bg-[#FFFDF5] border border-transparent hover:border-black transition-all"
                    >
                      <UserIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>PROFILE</span>
                    </Link>
                    <Link
                      href="/app/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-black hover:bg-[#FFFDF5] border border-transparent hover:border-black transition-all"
                    >
                      <Settings className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>SETTINGS</span>
                    </Link>
                  </div>

                  <div className="pt-2 border-t-2 border-black">
                    <button
                      onClick={async () => {
                        setProfileDropdownOpen(false);
                        await AuthService.signOut();
                        window.location.href = '/auth';
                      }}
                      className="btn-neo w-full flex items-center justify-center gap-2 py-2 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                    >
                      <LogOut className="w-3.5 h-3.5 stroke-[3px]" />
                      <span>SIGN OUT</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col justify-between border-r-3 border-black bg-white shrink-0 p-4">
          <div className="space-y-4">
            {/* Sidebar Brand Header */}
            <div className="pb-3 border-b-2 border-black/20">
              <Link
                href="/app"
                className="flex items-center gap-2"
                title="Resora — Personal Research Intelligence"
              >
                <ResoraLogo size="sm" variant="full" />
              </Link>
            </div>

            <div className="space-y-4">
              {/* RESEARCH */}
              <div>
                <div className="px-2 pb-1 text-[9px] font-mono font-black uppercase tracking-widest text-black/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#FF6B6B] border border-black inline-block"></span>
                  RESEARCH
                </div>
                <div className="space-y-1">
                  {researchNavItems.map((item) => {
                    const active = isActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 text-xs font-bold transition-all border-2 ${
                          active
                            ? 'bg-[#FF6B6B] text-black border-black shadow-[3px_3px_0px_0px_#000] font-black'
                            : 'bg-white text-black border-transparent hover:border-black hover:bg-[#FFFDF5] hover:shadow-[2px_2px_0px_0px_#000]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 stroke-[2.5] ${active ? 'text-black' : 'text-black/80'}`} />
                          <span className="text-[13px]">{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`px-1.5 py-0.2 text-[10px] font-mono font-black border border-black ${
                              item.badgeColor || (active ? 'bg-[#FFD93D] text-black' : 'bg-[#FFFDF5] text-black')
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

              {/* WORKSPACE */}
              <div>
                <div className="px-2 pb-1 text-[9px] font-mono font-black uppercase tracking-widest text-black/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#FFD93D] border border-black inline-block"></span>
                  WORKSPACE
                </div>
                <div className="space-y-1">
                  {workspaceNavItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 text-xs font-bold transition-all border-2 ${
                          active
                            ? 'bg-[#FFD93D] text-black border-black shadow-[3px_3px_0px_0px_#000] font-black'
                            : 'bg-white text-black border-transparent hover:border-black hover:bg-[#FFFDF5] hover:shadow-[2px_2px_0px_0px_#000]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 stroke-[2.5] ${active ? 'text-black' : 'text-black/80'}`} />
                          <span className="text-[13px]">{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`px-1.5 py-0.2 text-[10px] font-mono font-black border border-black ${
                              item.badgeColor || (active ? 'bg-[#FFD93D] text-black' : 'bg-[#FFFDF5] text-black')
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

              {/* KNOWLEDGE */}
              <div>
                <div className="px-2 pb-1 text-[9px] font-mono font-black uppercase tracking-widest text-black/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#C4B5FD] border border-black inline-block"></span>
                  KNOWLEDGE
                </div>
                <div className="space-y-1">
                  {knowledgeNavItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 text-xs font-bold transition-all border-2 ${
                          active
                            ? 'bg-[#C4B5FD] text-black border-black shadow-[3px_3px_0px_0px_#000] font-black'
                            : 'bg-white text-black border-transparent hover:border-black hover:bg-[#FFFDF5] hover:shadow-[2px_2px_0px_0px_#000]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 stroke-[2.5] ${active ? 'text-black' : 'text-black/80'}`} />
                          <span className="text-[13px]">{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`px-1.5 py-0.2 text-[10px] font-mono font-black border border-black ${
                              item.badgeColor || (active ? 'bg-[#FFD93D] text-black' : 'bg-[#FFFDF5] text-black')
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
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-3 border-t-2 border-black/20 space-y-2">
            <div className="px-2 text-[10px] font-mono font-black uppercase tracking-widest text-black/50 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#C4B5FD] border border-black"></span>
              SYSTEM
            </div>
            {bottomNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-bold transition-all border-2 ${
                    active
                      ? 'bg-[#FFD93D] text-black border-black shadow-[3px_3px_0px_0px_#000] font-black'
                      : 'bg-white text-black border-transparent hover:border-black hover:bg-[#FFFDF5] hover:shadow-[2px_2px_0px_0px_#000]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                    <span className="text-[13px]">{item.label}</span>
                  </div>
                </Link>
              );
            })}

            {/* User workspace summary badge */}
            <div className="pt-2">
              <div className="p-2.5 bg-[#FFFDF5] border-2 border-black text-[11px] flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-6 h-6 object-cover border border-black shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-[#FFD93D] border border-black flex items-center justify-center text-[10px] font-black shrink-0 uppercase">
                      {(user?.name || 'A')[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-black truncate max-w-[110px]">
                      {user?.name || 'Researcher'}
                    </div>
                    <div className="text-[9px] font-mono text-black/60 uppercase truncate">
                      {user?.email ? 'Authenticated' : 'Workspace'}
                    </div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 border border-black shrink-0"></span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/60 animate-in fade-in duration-100 flex flex-col justify-start">
            <div className="bg-white border-b-4 border-black p-5 space-y-4 shadow-[0px_8px_0px_0px_#000]">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <ResoraLogo size="sm" variant="full" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 border-2 border-black bg-[#FF6B6B] text-black"
                >
                  <X className="w-5 h-5 stroke-[3]" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {[...researchNavItems, ...workspaceNavItems, ...knowledgeNavItems].map((item) => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-2.5 text-xs font-black uppercase tracking-wider border-2 ${
                        active
                          ? 'bg-[#FF6B6B] text-black border-black shadow-[3px_3px_0px_0px_#000]'
                          : 'bg-white text-black border-black hover:bg-[#FFD93D]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 stroke-[2.5]" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-black bg-[#FFD93D] border border-black text-black">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-2 border-t-2 border-black flex gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openSaveModal();
                  }}
                  className="btn-neo flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#FF6B6B] text-black font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ CAPTURE RESOURCE</span>
                </button>
                <Link
                  href="/app/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 bg-white border-2 border-black text-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]"
                >
                  <Settings className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto bg-[#FFFDF5] pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar (Screens < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-3 border-black shadow-[0px_-2px_0px_0px_#000] flex items-center justify-around h-15 px-2">
        <Link
          href="/app"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-mono font-bold ${
            isActive('/app', true) ? 'text-[#FF6B6B] font-black' : 'text-black'
          }`}
        >
          <Home className="w-4 h-4 stroke-[2.5]" />
          <span>Home</span>
        </Link>

        <Link
          href="/app/assistant"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-mono font-bold ${
            isActive('/app/assistant') ? 'text-[#FF6B6B] font-black' : 'text-black'
          }`}
        >
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          <span>Assistant</span>
        </Link>

        {/* Center Prominent Capture Button */}
        <button
          onClick={openSaveModal}
          className="w-10 h-10 -mt-4 bg-[#FF6B6B] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center text-black font-black active:translate-x-0.5 active:translate-y-0.5"
          aria-label="Capture Resource"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
        </button>

        <Link
          href="/app/library"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-mono font-bold ${
            isActive('/app/library') ? 'text-[#FF6B6B] font-black' : 'text-black'
          }`}
        >
          <Library className="w-4 h-4 stroke-[2.5]" />
          <span>Library</span>
        </Link>

        <Link
          href="/app/inbox"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-mono font-bold relative ${
            isActive('/app/inbox') ? 'text-[#FF6B6B] font-black' : 'text-black'
          }`}
        >
          <Inbox className="w-4 h-4 stroke-[2.5]" />
          <span>Inbox</span>
          {metrics.inbox > 0 && (
            <span className="absolute top-0 right-3 px-1 text-[9px] font-black bg-[#FFD93D] border border-black text-black">
              {metrics.inbox}
            </span>
          )}
        </Link>
      </nav>
    </div>
  );
}
