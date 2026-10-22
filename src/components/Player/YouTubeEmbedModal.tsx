import React, { useEffect } from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';
import { YouTubeIcon } from '../Common/YouTubeIcon';
import type { Track } from '../../types';
import { usePlayer } from '../../context/PlayerContext';

interface YouTubeEmbedModalProps {
  track: Track | null;
  onClose: () => void;
}

export const YouTubeEmbedModal: React.FC<YouTubeEmbedModalProps> = ({ track, onClose }) => {
  const { pause } = usePlayer();

  useEffect(() => {
    if (track) {
      // Pause HTML5 audio when YouTube video player is active to avoid audio collision
      pause();
    }
  }, [track, pause]);

  if (!track) return null;

  // Use search query embed or specific video ID
  const searchQuery = encodeURIComponent(`${track.title} ${track.artist} official audio`);
  const embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${searchQuery}&autoplay=1`;
  const directWatchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${track.title} ${track.artist}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0f1118] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#141622]">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="p-1.5 rounded-lg bg-red-600/20 text-red-500">
              <YouTubeIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {track.title}
              </h2>
              <p className="text-xs text-zinc-400 truncate">
                {track.artist} &bull; Official YouTube Embed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={directWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs transition-colors"
            >
              <span>Open on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Frame */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <iframe
            src={embedUrl}
            title={`${track.title} - Official Video`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Footer info & ToS Compliance */}
        <div className="px-5 py-3 bg-[#11131c] border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Authorized Playback via Official YouTube Embedded Player</span>
          </div>
          <span className="text-zinc-500">
            Complies with YouTube API Terms of Service & creator monetization.
          </span>
        </div>
      </div>
    </div>
  );
};
