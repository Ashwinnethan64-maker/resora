'use client';

import React, { useState } from 'react';
import { useResora } from '@/context/ResoraContext';
import { ResoraLogo } from '@/components/brand/ResoraLogo';
import { ArrowRight, Check, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-none p-4 animate-in fade-in duration-100">
      <div className="max-w-md w-full bg-white border-4 border-black rounded-none p-6 md:p-8 space-y-6 shadow-[12px_12px_0px_0px_#000] relative">
        <button
          onClick={onClose}
          className="btn-neo absolute top-4 right-4 p-1.5 border-2 border-black bg-white hover:bg-[#FFD93D] text-black shadow-[2px_2px_0px_0px_#000] transition-colors"
        >
          <X className="w-4 h-4 stroke-[3px]" />
        </button>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <ResoraLogo size="md" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD93D] text-black border-2 border-black text-xs font-mono font-black uppercase shadow-[2px_2px_0px_0px_#000] -rotate-1">
                <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
                RESEARCH ONBOARDING
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-black">
                WELCOME TO RESORA
              </h2>
              <p className="text-xs md:text-sm font-bold text-black leading-relaxed">
                Personal Research Intelligence. "Save it. Understand it. Use it." Configure your workspace in 30 seconds.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setStep(2)}
                className="btn-neo w-full py-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs md:text-sm tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_#000] flex items-center justify-center gap-2"
              >
                <span>GET STARTED</span>
                <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Interests / Topics */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1.5 text-center">
              <h2 className="text-xl font-black uppercase tracking-tight text-black">
                WHAT DO YOU RESEARCH?
              </h2>
              <p className="text-xs font-bold text-black">
                Resora tunes taxonomy tags, use cases, and assistant synthesis around these topics.
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
                    className={`btn-neo text-xs px-3.5 py-2.5 rounded-none border-2 border-black font-black uppercase transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#FFD93D] text-black shadow-[3px_3px_0px_0px_#000]'
                        : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[1px_1px_0px_0px_#000]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t-2 border-black">
              <button
                onClick={() => setStep(1)}
                className="btn-neo px-4 py-2 border-2 border-black text-xs font-black uppercase text-black bg-white shadow-[2px_2px_0px_0px_#000]"
              >
                BACK
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-neo px-6 py-2.5 bg-[#C4B5FD] hover:bg-[#b8a6fb] text-black font-black uppercase text-xs tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000] flex items-center gap-1.5"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Save First Resource */}
        {step === 3 && (
          <form onSubmit={handleSaveFirstResource} className="space-y-6">
            <div className="space-y-1.5 text-center">
              <h2 className="text-xl font-black uppercase tracking-tight text-black">
                SAVE YOUR FIRST RESOURCE
              </h2>
              <p className="text-xs font-bold text-black">
                Paste any URL (article, tool, GitHub repository, documentation).
              </p>
            </div>

            <div className="pt-2">
              <input
                type="url"
                placeholder="https://github.com/... or article URL"
                value={firstUrl}
                onChange={(e) => setFirstUrl(e.target.value)}
                className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3.5 py-3 text-black font-bold text-xs focus:bg-[#FFD93D] focus:outline-none shadow-[3px_3px_0px_0px_#000]"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t-2 border-black">
              <button
                type="button"
                onClick={onClose}
                className="btn-neo px-4 py-2 border-2 border-black text-xs font-black uppercase text-black bg-white shadow-[2px_2px_0px_0px_#000]"
              >
                SKIP FOR NOW
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-neo px-6 py-2.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000] flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>{firstUrl.trim() ? 'SAVE & FINISH' : 'FINISH'}</span>
                <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
