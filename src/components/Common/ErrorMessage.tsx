import React from 'react';
import { RefreshCw } from 'lucide-react';

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
