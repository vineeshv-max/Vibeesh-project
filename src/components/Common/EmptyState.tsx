import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Disc3, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Disc3,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#13151c]/60 border border-white/5 rounded-2xl max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium text-sm rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  providerInfo?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, providerInfo }) => {
  return (
    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 my-4">
      <div className="space-y-1">
        <p className="font-medium text-sm">{message}</p>
        {providerInfo && (
          <p className="text-xs text-rose-400/80">{providerInfo}</p>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-medium transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};
