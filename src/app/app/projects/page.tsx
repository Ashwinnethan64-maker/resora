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
        return 'bg-[#FFD93D] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]';
      case 'planning':
      case 'planned':
        return 'bg-[#C4B5FD] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]';
      case 'in review':
      case 'paused':
        return 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]';
      case 'completed':
        return 'bg-[#FF6B6B] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]';
      case 'archived':
        return 'bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]';
      default:
        return 'bg-[#FFFDF5] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]';
    }
  };

  const getProjectTypeIcon = (type?: ProjectType) => {
    switch (type) {
      case 'hackathon':
        return <Trophy className="w-4 h-4 text-black" />;
      case 'startup':
        return <Rocket className="w-4 h-4 text-black" />;
      case 'research':
        return <BookOpen className="w-4 h-4 text-black" />;
      case 'freelance':
        return <Briefcase className="w-4 h-4 text-black" />;
      case 'learning':
        return <GraduationCap className="w-4 h-4 text-black" />;
      default:
        return <Layers className="w-4 h-4 text-black" />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header: Neo-Brutalist Research Boards */}
      <div className="border-b-4 border-black pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD93D] text-black border-2 border-black text-xs font-black uppercase tracking-wider mb-3 shadow-[3px_3px_0px_0px_#000] -rotate-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] border border-black" />
            RESEARCH BOARDS
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-black leading-none">
            PROJECT<br />
            WORKSPACES.
          </h1>
          <p className="text-sm md:text-base font-bold text-black mt-3 max-w-xl">
            Contextual research environments. Organize your global library around active objectives without duplicating data.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-neo flex items-center gap-2 px-6 py-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs md:text-sm tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_#000] self-start sm:self-auto"
        >
          <Plus className="w-5 h-5 stroke-[3px]" />
          <span>+ NEW PROJECT BOARD</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 border-b-4 border-black pb-4 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`btn-neo px-4 py-2.5 rounded-none border-2 border-black font-black uppercase text-xs tracking-wider transition-all ${
            activeTab === 'all'
              ? 'bg-[#FFD93D] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          ALL PROJECTS ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`btn-neo px-4 py-2.5 rounded-none border-2 border-black font-black uppercase text-xs tracking-wider transition-all ${
            activeTab === 'active'
              ? 'bg-[#FF6B6B] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          ACTIVE BOARDS
        </button>
        <button
          onClick={() => setActiveTab('hackathon')}
          className={`btn-neo px-4 py-2.5 rounded-none border-2 border-black font-black uppercase text-xs tracking-wider transition-all flex items-center gap-1.5 ${
            activeTab === 'hackathon'
              ? 'bg-[#C4B5FD] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <Trophy className="w-4 h-4 stroke-[3px]" />
          <span>HACKATHONS</span>
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`btn-neo px-4 py-2.5 rounded-none border-2 border-black font-black uppercase text-xs tracking-wider transition-all ${
            activeTab === 'archived'
              ? 'bg-black text-white shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          ARCHIVED
        </button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-16 text-center rounded-none border-4 border-black bg-white shadow-[8px_8px_0px_0px_#000] p-8 space-y-5">
          <div className="w-16 h-16 bg-[#FFD93D] border-4 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#000] rotate-2">
            <FolderKanban className="w-8 h-8 text-black stroke-[2.5px]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase text-black">NO PROJECT WORKSPACES FOUND</h3>
            <p className="text-xs md:text-sm font-bold text-black max-w-sm mx-auto">
              Create a project workspace to describe what you are building and let Resora recommend relevant library resources.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-neo inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] text-black border-4 border-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_#000]"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span>CREATE FIRST PROJECT</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((proj) => {
            const docCount = resources.filter(
              (r) => proj.resource_ids?.includes(r.id) && (r.resource_type === 'pdf' || r.resource_type === 'document')
            ).length;

            return (
              <Link
                key={proj.id}
                href={`/app/projects/${proj.id}`}
                className="card-neo p-6 rounded-none bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] group flex flex-col justify-between space-y-4 relative"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2.5 rounded-none bg-[#FFD93D] border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0">
                        {getProjectTypeIcon(proj.project_type)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg md:text-xl font-black uppercase text-black group-hover:text-[#FF6B6B] transition-colors truncate">
                          {proj.name}
                        </h3>
                        {proj.project_type && (
                          <span className="text-[11px] font-mono font-black text-black uppercase tracking-wider bg-[#FFFDF5] px-2 py-0.5 border border-black inline-block mt-0.5">
                            TYPE: {proj.project_type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-none uppercase shrink-0 ${getStatusColor(proj.status)}`}>
                      {proj.status}
                    </span>
                  </div>

                  {proj.objective ? (
                    <div className="text-xs md:text-sm font-medium text-black leading-relaxed bg-[#FFFDF5] p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                      <strong className="text-black font-mono font-black text-[10px] uppercase block mb-1 bg-[#FFD93D] px-1 w-max border border-black">OBJECTIVE</strong>
                      {proj.objective}
                    </div>
                  ) : (
                    <p className="text-xs md:text-sm font-medium text-black line-clamp-2 leading-relaxed">
                      {proj.description || 'Custom project workspace.'}
                    </p>
                  )}

                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-mono font-black px-2 py-0.5 rounded-none bg-[#C4B5FD] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]"
                        >
                          {tech}
                        </span>
                      ))}
                      {proj.technologies.length > 4 && (
                        <span className="text-[10px] font-mono font-black text-black self-center px-1">
                          +{proj.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t-2 border-black flex items-center justify-between text-xs text-black">
                  <div className="flex items-center gap-3 font-mono font-bold text-[11px]">
                    <span className="flex items-center gap-1 bg-[#FFFDF5] px-2 py-0.5 border border-black font-black">
                      <Layers className="w-3.5 h-3.5 text-black" />
                      {proj.resource_ids?.length || 0} RESOURCES
                    </span>
                    {docCount > 0 && (
                      <span className="flex items-center gap-1 bg-[#FF6B6B] text-black px-2 py-0.5 border border-black font-black">
                        <FileText className="w-3.5 h-3.5" />
                        {docCount} DOCS
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-black font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(proj.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-black group-hover:text-[#FF6B6B] flex items-center gap-1.5 font-black text-xs uppercase tracking-wider group-hover:translate-x-1 transition-all">
                    <span>OPEN BOARD</span>
                    <ArrowRight className="w-4 h-4 stroke-[3px]" />
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
