import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200 overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className={cn(
              "p-3 rounded-xl shrink-0",
              variant === 'danger' ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" :
              variant === 'warning' ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" :
              "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
            )}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95",
                variant === 'danger' ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" :
                variant === 'warning' ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20" :
                "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
