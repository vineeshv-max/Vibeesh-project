import React from 'react';
import { X, Trash2, Music2, Play, Pause } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export const QueueDrawer: React.FC = () => {
  const {
    queue,
    currentTrack,
    isPlaying,
    isQueueOpen,
    setIsQueueOpen,
    playTrack,
    togglePlay,
    removeFromQueue,
    clearQueue,
  } = usePlayer();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#12141c] border-l border-white/10 shadow-2xl flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-base">Play Queue</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
            {queue.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              title="Clear queue"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsQueueOpen(false)}
            aria-label="Close"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {queue.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-sm">
            Queue is empty. Play or add tracks to build your queue!
          </div>
        ) : (
          queue.map((track, idx) => {
            const isNowPlaying = track.id === currentTrack?.id;
            const isPlayingThis = isNowPlaying && isPlaying;

            return (
              <div
                key={`${track.id}-${idx}`}
                className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                  isNowPlaying
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                    : 'hover:bg-white/5 text-zinc-300'
                }`}
                onClick={() => {
                  if (isNowPlaying) {
                    togglePlay();
                  } else {
                    playTrack(track);
                  }
                }}
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-900">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                      isNowPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {isPlayingThis ? (
                      <Pause className="w-4 h-4 text-emerald-400 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold truncate ${
                      isNowPlaying ? 'text-emerald-400' : 'text-zinc-100 group-hover:text-white'
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                </div>

                {isNowPlaying && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20">
                    Playing
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromQueue(idx);
                  }}
                  title="Remove from queue"
                  className="p-1 rounded text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
