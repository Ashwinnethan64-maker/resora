'use client';

import React, { useState } from 'react';
import { useResora } from '@/context/ResoraContext';
import { ResoraLogo } from '@/components/brand/ResoraLogo';
import { Sparkles, ArrowRight, Check, X } from 'lucide-react';

const SUGGESTED_INTERESTS = [
  'AI Tools & Agents',
  'Developer Tools & CLI',
  'Research Papers & PDFs',
  'UI/UX & Design Systems',
  'Hackathons & Competitions',
  'Startups & Architecture',
  'Tutorials & Learning',
];

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { saveResource, showToast } = useResora();
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['AI Tools & Agents']);
  const [firstUrl, setFirstUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSaveFirstResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstUrl.trim()) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await saveResource({
        url: firstUrl.trim(),
        tags: selectedInterests.map((i) => i.split(' ')[0]),
        use_cases: ['Research', 'Build'],
      });
      showToast('First resource saved to your library!');
      onClose();
    } catch {
      showToast('Failed to save first resource.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-[#0d0f17] border border-[#1e2335] rounded-2xl p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <ResoraLogo size="md" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-slate-100">
                Welcome to Resora
              </h2>
              <p className="text-xs text-slate-400">
                Your personal research intelligence platform. Let's customize your workspace in 30 seconds.
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => setStep(2)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-900/40 transition-all flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Interests / Topics */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1 text-center">
              <h2 className="text-base font-bold tracking-tight text-slate-100">
                What do you usually research & save?
              </h2>
              <p className="text-xs text-slate-400">
                Resora will tune tags, use cases, and assistant synthesis around these topics.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 justify-center">
              {SUGGESTED_INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                        : 'bg-[#121522] border-[#22273a] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-indigo-400" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-900/30"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Save First Resource */}
        {step === 3 && (
          <form onSubmit={handleSaveFirstResource} className="space-y-4">
            <div className="space-y-1 text-center">
              <h2 className="text-base font-bold tracking-tight text-slate-100">
                Save your first resource
              </h2>
              <p className="text-xs text-slate-400">
                Paste any URL (article, tool, GitHub repository, documentation).
              </p>
            </div>

            <div className="pt-2">
              <input
                type="url"
                placeholder="https://example.com/article-or-tool"
                value={firstUrl}
                onChange={(e) => setFirstUrl(e.target.value)}
                className="w-full rounded-xl bg-[#090b12] border border-[#212638] px-3.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-900/30 disabled:opacity-50"
              >
                <span>{firstUrl.trim() ? 'Save & Finish' : 'Finish'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
