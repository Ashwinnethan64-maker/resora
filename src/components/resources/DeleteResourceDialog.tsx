import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteResourceDialogProps {
  isOpen: boolean;
  resourceTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteResourceDialog({
  isOpen,
  resourceTitle,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteResourceDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-[#11131c] border border-rose-900/40 shadow-2xl shadow-black/90 p-5 z-10 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1c2132]">
          <div className="flex items-center gap-2.5 text-rose-400 font-semibold text-sm">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span>Delete this resource?</span>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-md text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs text-slate-300">
          <p>
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-100 font-medium">"{resourceTitle}"</strong>?
          </p>
          <p className="text-slate-500 leading-relaxed">
            This resource will be permanently removed from your library, projects, and collections. This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1c2132]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-3.5 py-1.5 rounded-lg border border-[#23283a] text-slate-400 hover:text-slate-200 hover:bg-[#181c2b] text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950/40 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete resource'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
