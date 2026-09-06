'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useResora } from '@/context/ResoraContext';
import { ProjectModel, ProjectType } from '@/types/database';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import {
  FolderKanban,
  Plus,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  Trophy,
  Rocket,
  BookOpen,
  Briefcase,
  GraduationCap,
  FileText
} from 'lucide-react';

export default function ProjectsPage() {
  const { projects, resources } = useResora();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'hackathon' | 'archived'>('all');

  const filteredProjects = projects.filter((proj) => {
    if (activeTab === 'active') return proj.status !== 'archived' && proj.status !== 'Archived';
    if (activeTab === 'archived') return proj.status === 'archived' || proj.status === 'Archived';
    if (activeTab === 'hackathon') return proj.project_type === 'hackathon';
    return true;
  });

  const getStatusColor = (status: ProjectModel['status']) => {
    const s = String(status).toLowerCase();
    switch (s) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'planning':
      case 'planned':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25';
      case 'in review':
      case 'paused':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'completed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
      case 'archived':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getProjectTypeIcon = (type?: ProjectType) => {
    switch (type) {
      case 'hackathon':
        return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      case 'startup':
        return <Rocket className="w-3.5 h-3.5 text-rose-400" />;
      case 'research':
        return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
      case 'freelance':
        return <Briefcase className="w-3.5 h-3.5 text-sky-400" />;
      case 'learning':
        return <GraduationCap className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2132]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
              Project Workspaces
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Phase 5
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Contextual research environments. Organize your global library around active objectives without duplicating data.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-900/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ New project</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1c2132] pb-3 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
            activeTab === 'active'
              ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Workspaces
        </button>
        <button
          onClick={() => setActiveTab('hackathon')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'hackathon'
              ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-3 h-3 text-amber-400" />
          <span>Hackathons</span>
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
            activeTab === 'archived'
              ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Archived
        </button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-[#23293c] p-8 space-y-3">
          <FolderKanban className="w-10 h-10 text-slate-600 mx-auto stroke-1" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-300">No project workspaces found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create a project workspace to describe what you are building and let Resora recommend relevant library resources.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((proj) => {
            const docCount = resources.filter(
              (r) => proj.resource_ids?.includes(r.id) && (r.resource_type === 'pdf' || r.resource_type === 'document')
            ).length;

            return (
              <Link
                key={proj.id}
                href={`/app/projects/${proj.id}`}
                className="p-5 rounded-2xl bg-[#11131c] hover:bg-[#151825] border border-[#1f2433] hover:border-[#30384f] transition-all group flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-[#0e1017] border border-[#1f2536] shrink-0">
                        {getProjectTypeIcon(proj.project_type)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                          {proj.name}
                        </h3>
                        {proj.project_type && (
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                            {proj.project_type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border capitalize shrink-0 ${getStatusColor(proj.status)}`}>
                      {proj.status}
                    </span>
                  </div>

                  {proj.objective ? (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-[#0e1018] p-2.5 rounded-xl border border-[#1a1f2e]">
                      <strong className="text-slate-400 font-mono text-[10px] uppercase block mb-0.5">Objective</strong>
                      {proj.objective}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {proj.description || 'Custom project workspace.'}
                    </p>
                  )}

                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#161a27] text-slate-300 border border-[#242c42]"
                        >
                          {tech}
                        </span>
                      ))}
                      {proj.technologies.length > 4 && (
                        <span className="text-[10px] font-mono text-slate-500 self-center">
                          +{proj.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#1c2132] flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {proj.resource_ids?.length || 0} resources
                    </span>
                    {docCount > 0 && (
                      <span className="flex items-center gap-1 text-indigo-400">
                        <FileText className="w-3 h-3" />
                        {docCount} {docCount === 1 ? 'doc' : 'docs'}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      {new Date(proj.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-slate-400 group-hover:text-indigo-400 flex items-center gap-1 font-medium text-xs">
                    <span>Open workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
