'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useResora } from '@/context/ResoraContext';
import { ProjectModel, ProjectType } from '@/types/database';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { PageHeader } from '@/components/ui/SectionLabel';
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
        return 'bg-[#FFD93D] text-black border border-black';
      case 'planning':
      case 'planned':
        return 'bg-[#C4B5FD] text-black border border-black';
      case 'completed':
        return 'bg-[#FF6B6B] text-black border border-black';
      default:
        return 'bg-white text-black border border-black';
    }
  };

  const getProjectTypeIcon = (type?: ProjectType) => {
    switch (type) {
      case 'hackathon':
        return <Trophy className="w-3.5 h-3.5 text-black" />;
      case 'startup':
        return <Rocket className="w-3.5 h-3.5 text-black" />;
      case 'research':
        return <BookOpen className="w-3.5 h-3.5 text-black" />;
      case 'freelance':
        return <Briefcase className="w-3.5 h-3.5 text-black" />;
      case 'learning':
        return <GraduationCap className="w-3.5 h-3.5 text-black" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-black" />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header */}
      <PageHeader
        eyebrow="RESEARCH BOARDS"
        eyebrowColor="yellow"
        eyebrowIcon={<span className="w-2.5 h-2.5 bg-black rotate-45 inline-block shrink-0" />}
        title={`PROJECT WORKSPACES (${filteredProjects.length}).`}
        description="Organize research assets around active development goals, hackathons, and product builds."
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-neo flex items-center gap-2 px-5 py-3 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs md:text-sm tracking-wider border-2 border-black shadow-[3px_3px_0px_#000]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ NEW PROJECT</span>
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-black/15 pb-3 text-xs overflow-x-auto">
        {[
          { id: 'all', label: 'All Projects' },
          { id: 'active', label: 'Active' },
          { id: 'hackathon', label: 'Hackathons' },
          { id: 'archived', label: 'Archived' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 border-2 border-black font-bold uppercase transition-all shadow-[2px_2px_0px_#000] ${
              activeTab === tab.id
                ? 'bg-[#FFD93D] text-black font-black'
                : 'bg-white text-black/80 hover:bg-[#FFFDF5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-8 text-center bg-white border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
          <p className="text-sm font-bold text-black">No projects in this view.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-neo px-4 py-2 bg-[#FF6B6B] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000]"
          >
            + Create New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            return (
              <Link
                key={project.id}
                href={`/app/projects/${project.id}`}
                className="card-neo p-5 bg-white border-3 border-black shadow-[5px_5px_0px_#000] flex flex-col justify-between space-y-4 hover:border-black"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#FFD93D] border border-black flex items-center justify-center">
                        {getProjectTypeIcon(project.project_type)}
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase text-black/70">
                        {project.project_type || 'WORKSPACE'}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-black group-hover:text-[#FF6B6B] transition-colors leading-snug">
                      {project.name}
                    </h3>
                    <p className="text-xs text-black/75 mt-1.5 line-clamp-2 font-normal leading-relaxed">
                      {project.objective || project.description || 'No objective specified.'}
                    </p>
                  </div>

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-mono font-bold px-1.5 py-0.2 border border-black bg-[#FFFDF5] text-black"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-[10px] font-mono text-black/50 self-center">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t-2 border-black flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-black/70">Enter Workspace</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] text-black" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
