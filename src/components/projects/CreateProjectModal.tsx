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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#10121b] border border-[#23293d] shadow-2xl shadow-black/90 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c2132]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                {step === 'template' ? 'Choose Project Workspace Template' : 'Configure Project Workspace'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {step === 'template'
                  ? 'Select a template optimized for your research workflow, or start blank.'
                  : `Configuring ${selectedTemplate.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: TEMPLATE SELECTOR */}
        {step === 'template' ? (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROJECT_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="p-4 rounded-xl bg-[#141824] hover:bg-[#181d2c] border border-[#22293d] hover:border-indigo-500/40 cursor-pointer transition-all group relative space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-[#0e111a] border border-[#1d2232]">
                      {getTemplateIcon(tmpl.icon)}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white">
                      {tmpl.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                      {tmpl.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tmpl.defaultGroups.slice(0, 3).map((grp) => (
                      <span
                        key={grp}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#10131d] text-slate-400 border border-[#1f2537]"
                      >
                        {grp}
                      </span>
                    ))}
                    {tmpl.defaultGroups.length > 3 && (
                      <span className="text-[9px] font-mono text-slate-500 self-center">
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
                className="text-xs text-slate-400 hover:text-slate-200 underline font-mono"
              >
                Skip template & create custom workspace
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: CONTEXT & DETAILS */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2132]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-indigo-400 font-medium">
                  Template: {selectedTemplate.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep('template')}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline"
              >
                Change template
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold">Project Name *</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. AI Campus Assistant or Distributed Consensus Engine"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold">
                What are you building? (Description)
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of what you are creating or exploring..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3.5 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold">
                Objective <span className="text-slate-500 font-normal">(Used by Resora to find relevant library resources)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Build an autonomous agentic research copilot with page citations and persistent vector caching."
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3.5 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">
                  Technologies / Stack <span className="text-slate-500 font-normal">(Comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Supabase, PyTorch"
                  value={technologiesInput}
                  onChange={(e) => setTechnologiesInput(e.target.value)}
                  className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3.5 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Target Users / Scope</label>
                <input
                  type="text"
                  placeholder="e.g. Students, Hackathon Builders, Freelancers"
                  value={targetUsers}
                  onChange={(e) => setTargetUsers(e.target.value)}
                  className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3.5 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold">Constraints / Deadlines</label>
              <input
                type="text"
                placeholder="e.g. 48 hour sprint, zero external paid APIs, strict RLS isolation"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3.5 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-[#1a1f2e]">
              <button
                type="button"
                onClick={() => setStep('template')}
                className="px-3.5 py-1.5 rounded-lg border border-[#23283a] text-slate-400 hover:text-slate-200"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-900/30 transition-all disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Creating Workspace...' : 'Create Workspace'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
