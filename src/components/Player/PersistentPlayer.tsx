import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Maximize2,
  AlertCircle,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { YouTubeIcon } from '../Common/YouTubeIcon';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from '../Common/Badge';
import type { Track } from '../../types';

interface PersistentPlayerProps {
  onOpenYouTubeEmbed?: (track: Track) => void;
}

export const PersistentPlayer: React.FC<PersistentPlayerProps> = ({ onOpenYouTubeEmbed }) => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    error,
    clearError,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setIsNowPlayingOpen,
    setIsQueueOpen,
  } = usePlayer();

  const { isLiked, toggleLike } = useLibrary();

  if (!currentTrack) {
    return null;
  }

  const liked = isLiked(currentTrack.id);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0e14]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.7)]">
      {/* Error Bar if stream failed */}
      {error && (
        <div className="bg-rose-950/80 border-b border-rose-500/30 px-4 py-1.5 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="p-1 hover:text-white rounded"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main player bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3 min-w-0 w-1/4 max-w-[260px] sm:max-w-[300px]">
          <div
            onClick={() => setIsNowPlayingOpen(true)}
            className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-900 shadow-md cursor-pointer group"
          >
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p
              onClick={() => setIsNowPlayingOpen(true)}
              className="text-xs sm:text-sm font-semibold text-white truncate cursor-pointer hover:text-emerald-400 transition-colors"
              title={currentTrack.title}
            >
              {currentTrack.title}
            </p>
            <p className="text-[11px] sm:text-xs text-zinc-400 truncate" title={currentTrack.artist}>
              {currentTrack.artist}
            </p>
            <div className="mt-0.5 hidden sm:flex items-center gap-1.5 flex-wrap">
              <Badge sourceType={currentTrack.sourceType} isPlayable={currentTrack.isPlayable} />
              {currentTrack.sourceType === 'preview' && currentTrack.originalUrl && (
                <a
                  href={currentTrack.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium"
                  title="Listen to the full song on Apple Music / official platform"
                >
                  <span>Full Song</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>

          {onOpenYouTubeEmbed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenYouTubeEmbed(currentTrack);
              }}
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-red-400 transition-colors shrink-0 hidden sm:block"
              title="Watch Official YouTube Video"
            >
              <YouTubeIcon className="w-4 h-4 text-red-500" />
            </button>
          )}

          <button
            onClick={() => toggleLike(currentTrack)}
            aria-label={liked ? 'Unlike' : 'Like'}
            className={`p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0 ${
              liked ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Center: Playback Controls & Seekbar */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-full transition-colors hidden sm:block ${
                shuffle ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={prevTrack}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Previous"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-black" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Next"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-full transition-colors hidden sm:block ${
                repeatMode !== 'off' ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Progress / Seek bar */}
          <div className="w-full flex items-center gap-2.5 text-[11px] font-mono text-zinc-400">
            <span className="w-8 text-right hidden sm:block">{formatTime(currentTime)}</span>
            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, #10b981 ${progressPercent}%, #272a38 ${progressPercent}%)`,
                }}
              />
            </div>
            <span className="w-8 hidden sm:block">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Actions, Queue, Volume */}
        <div className="flex items-center justify-end gap-3 w-1/4">
          <button
            onClick={() => setIsQueueOpen(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors hidden md:block"
            title="Queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsNowPlayingOpen(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Full Screen / Expanded Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="hidden lg:flex items-center gap-2 w-28">
            <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full"
              style={{
                background: `linear-gradient(to right, #10b981 ${
                  (isMuted ? 0 : volume) * 100
                }%, #272a38 ${(isMuted ? 0 : volume) * 100}%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
