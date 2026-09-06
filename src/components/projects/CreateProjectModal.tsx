'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { ProjectType } from '@/types/database';
import { PROJECT_TEMPLATES, ProjectTemplate } from '@/lib/projects/project-templates';
import {
  X,
  Sparkles,
  Trophy,
  Layers,
  BookOpen,
  Rocket,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Check,
  Plus
} from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const { createProject, showToast } = useResora();

  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate>(PROJECT_TEMPLATES[0]);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [technologiesInput, setTechnologiesInput] = useState('');
  const [constraints, setConstraints] = useState('');
  const [targetUsers, setTargetUsers] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('hackathon');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setProjectType(template.projectType);
    setObjective(template.defaultObjective);
    setTechnologiesInput(template.suggestedTechnologies.join(', '));
    setStep('details');
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-indigo-400" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-emerald-400" />;
      case 'Rocket':
        return <Rocket className="w-5 h-5 text-rose-400" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-sky-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const technologies = technologiesInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const project = await createProject({
        name: name.trim(),
        description: description.trim() || selectedTemplate.description,
        objective: objective.trim() || selectedTemplate.defaultObjective,
        project_type: projectType,
        template_id: selectedTemplate.id,
        technologies,
        constraints: constraints.trim(),
        target_users: targetUsers.trim(),
        groups: selectedTemplate.defaultGroups,
      });

      onClose();
      router.push(`/app/projects/${project.id}`);
    } catch {
      showToast('Failed to create project workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-none animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-none bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-[#FFFDF5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-[#FFD93D] border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_0px_#000]">
              <Sparkles className="w-4 h-4 stroke-[2.5px]" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-black">
                {step === 'template' ? 'CHOOSE PROJECT WORKSPACE TEMPLATE' : 'CONFIGURE PROJECT WORKSPACE'}
              </h2>
              <p className="text-xs text-black font-medium">
                {step === 'template'
                  ? 'Select a template optimized for your research workflow, or start blank.'
                  : `Configuring ${selectedTemplate.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-neo p-1.5 border-2 border-black bg-white hover:bg-[#FFD93D] text-black shadow-[2px_2px_0px_0px_#000] transition-colors"
          >
            <X className="w-4 h-4 stroke-[3px]" />
          </button>
        </div>

        {/* STEP 1: TEMPLATE SELECTOR */}
        {step === 'template' ? (
          <div className="p-6 overflow-y-auto space-y-5 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PROJECT_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="card-neo p-5 rounded-none bg-[#FFFDF5] hover:bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] cursor-pointer transition-all group relative space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-none bg-[#FFD93D] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                      {getTemplateIcon(tmpl.icon)}
                    </div>
                    <ArrowRight className="w-4 h-4 text-black stroke-[3px] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase text-black group-hover:text-[#FF6B6B] transition-colors">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-black font-medium leading-relaxed mt-1">
                      {tmpl.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tmpl.defaultGroups.slice(0, 3).map((grp) => (
                      <span
                        key={grp}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-[#C4B5FD] text-black border border-black font-black"
                      >
                        {grp}
                      </span>
                    ))}
                    {tmpl.defaultGroups.length > 3 && (
                      <span className="text-[10px] font-mono text-black font-bold self-center">
                        +{tmpl.defaultGroups.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => {
                  setSelectedTemplate({
                    id: 'custom',
                    name: 'Custom Project',
                    projectType: 'other',
                    description: 'Custom research workspace.',
                    icon: 'Layers',
                    defaultObjective: '',
                    suggestedTechnologies: [],
                    defaultGroups: ['Research', 'Reference', 'Tasks'],
                    starterChecklist: [],
                  });
                  setProjectType('other');
                  setObjective('');
                  setTechnologiesInput('');
                  setStep('details');
                }}
                className="text-xs font-black uppercase text-black hover:text-[#FF6B6B] underline font-mono"
              >
                Skip template & create custom workspace →
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: CONTEXT & DETAILS */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs bg-white">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-black bg-[#FFD93D] px-2.5 py-0.5 border border-black uppercase">
                  Template: {selectedTemplate.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep('template')}
                className="text-xs font-black uppercase text-black hover:underline"
              >
                ← Change template
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-black font-black uppercase text-xs">Project Name *</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. AI Campus Assistant or Distributed Consensus Engine"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3.5 py-2.5 text-black placeholder-black/50 focus:bg-[#FFD93D] focus:outline-none text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-black font-black uppercase text-xs">
                What are you building? (Description)
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of what you are creating or exploring..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3.5 py-2 text-black placeholder-black/50 focus:bg-[#FFD93D] focus:outline-none text-xs resize-none font-medium shadow-[3px_3px_0px_0px_#000]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-black font-black uppercase text-xs">
                Objective <span className="text-black/60 font-bold">(Used by Resora to find relevant library resources)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Build an autonomous agentic research copilot with page citations and persistent vector caching."
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3.5 py-2 text-black placeholder-black/50 focus:bg-[#FFD93D] focus:outline-none text-xs resize-none font-medium shadow-[3px_3px_0px_0px_#000]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-black font-black uppercase text-xs">
                  Technologies / Stack <span className="text-black/60 font-bold">(Comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Supabase, PyTorch"
                  value={technologiesInput}
                  onChange={(e) => setTechnologiesInput(e.target.value)}
                  className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3.5 py-2.5 text-black placeholder-black/50 focus:bg-[#FFD93D] focus:outline-none text-xs font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#000]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-black font-black uppercase text-xs">Target Users / Scope</label>
                <input
                  type="text"
                  placeholder="e.g. Students, Hackathon Builders, Freelancers"
                  value={targetUsers}
                  onChange={(e) => setTargetUsers(e.target.value)}
                  className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3.5 py-2.5 text-black placeholder-black/50 focus:bg-[#FFD93D] focus:outline-none text-xs font-bold uppercase shadow-[3px_3px_0px_0px_#000]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-black font-black uppercase text-xs">Constraints / Deadlines</label>
              <input
                type="text"
                placeholder="e.g. 48 hour sprint, zero external paid APIs, strict RLS isolation"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3.5 py-2.5 text-black placeholder-black/50 focus:bg-[#FFD93D] focus:outline-none text-xs font-bold uppercase shadow-[3px_3px_0px_0px_#000]"
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-4 flex items-center justify-between border-t-4 border-black">
              <button
                type="button"
                onClick={() => setStep('template')}
                className="btn-neo px-4 py-2 border-2 border-black text-black font-black uppercase text-xs bg-white shadow-[2px_2px_0px_0px_#000]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="btn-neo flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000] disabled:opacity-50"
              >
                <Plus className="w-4 h-4 stroke-[3px]" />
                <span>{isSubmitting ? 'Creating Workspace...' : 'Create Workspace'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
