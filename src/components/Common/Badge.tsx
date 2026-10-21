import React from 'react';
import type { TrackSourceType } from '../../types';

interface BadgeProps {
  sourceType: TrackSourceType;
  isPlayable: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ sourceType, isPlayable, className = '' }) => {
  if (!isPlayable || sourceType === 'metadata_only') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50 ${className}`}
        title="Metadata catalog item. Audio stream not authorized from this provider."
      >
        Metadata Only
      </span>
    );
  }

  switch (sourceType) {
    case 'full':
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}
          title="Full length authorized audio track under Creative Commons license."
        >
          Full Track (CC)
        </span>
      );
    case 'archive':
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className}`}
          title="Preserved public domain / archive audio recording."
        >
          Archive Stream
        </span>
      );
    case 'podcast':
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30 ${className}`}
          title="Official playable podcast episode audio."
        >
          Full Podcast
        </span>
      );
    case 'preview':
    default:
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 ${className}`}
          title="Official high-quality preview stream."
        >
          Preview (30s)
        </span>
      );
  }
};
