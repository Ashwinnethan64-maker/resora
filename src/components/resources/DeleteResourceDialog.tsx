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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-100">
      <div className="fixed inset-0" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-none bg-[#FFFDF5] border-4 border-black shadow-[12px_12px_0px_0px_#000] p-5 z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-4 border-black">
          <div className="flex items-center gap-2.5 text-black font-black text-sm uppercase tracking-tight">
            <div className="w-8 h-8 rounded-none bg-[#FF6B6B] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
              <AlertTriangle className="w-4 h-4 stroke-[3px]" />
            </div>
            <span>DELETE THIS RESOURCE?</span>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-none text-black hover:bg-[#FF6B6B] border-2 border-black transition-colors"
          >
            <X className="w-4 h-4 stroke-[3px]" />
          </button>
        </div>

        <div className="space-y-2 text-xs text-black font-mono">
          <p className="font-bold">
            Are you sure you want to permanently delete{' '}
            <span className="bg-[#FFD93D] px-1.5 py-0.5 border border-black font-black text-black">
              "{resourceTitle}"
            </span>
            ?
          </p>
          <p className="text-black/80 font-medium leading-relaxed">
            This resource will be permanently removed from your library, projects, and collections. This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="btn-neo px-4 py-2 rounded-none border-2 border-black text-black font-black uppercase text-xs bg-white hover:bg-black/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="btn-neo flex items-center gap-1.5 px-5 py-2 rounded-none bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs border-4 border-black shadow-[4px_4px_0px_0px_#000] transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[3px]" />
            <span>{isDeleting ? 'DELETING...' : 'DELETE RESOURCE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
