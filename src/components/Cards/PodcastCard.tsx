import React from 'react';
import { Mic, Play } from 'lucide-react';
import type { Podcast } from '../../types';

interface PodcastCardProps {
  podcast: Podcast;
  onClick: (podcast: Podcast) => void;
}

export const PodcastCard: React.FC<PodcastCardProps> = ({ podcast, onClick }) => {
  return (
    <div
      onClick={() => onClick(podcast)}
      className="group flex flex-col p-3 rounded-2xl bg-[#13151c]/90 hover:bg-[#181b24] border border-white/5 hover:border-purple-500/30 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-purple-950/20"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 mb-3 shadow-md">
        <img
          src={podcast.coverUrl}
          alt={podcast.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80';
          }}
        />

        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/80 backdrop-blur-md text-white flex items-center gap-1 shadow">
          <Mic className="w-3 h-3" />
          Podcast
        </div>

        <button
          className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:scale-110 active:scale-95"
          aria-label="View episodes"
        >
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </button>
      </div>

      <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-purple-300 truncate mb-1" title={podcast.title}>
        {podcast.title}
      </h4>
      <p className="text-xs text-zinc-400 truncate mb-2" title={podcast.publisher}>
        {podcast.publisher}
      </p>

      <span className="mt-auto inline-block text-[11px] text-zinc-500 truncate">
        {podcast.category}
      </span>
    </div>
  );
};
