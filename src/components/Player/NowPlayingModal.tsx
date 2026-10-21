import React from 'react';
import {
  X,
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
  Radio,
  ExternalLink,
  Keyboard,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from '../Common/Badge';

export const NowPlayingModal: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    setIsQueueOpen,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const { isLiked, toggleLike } = useLibrary();

  if (!isNowPlayingOpen || !currentTrack) return null;

  const liked = isLiked(currentTrack.id);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#08090d] text-white animate-fadeIn overflow-hidden">
      {/* Blurred background ambience from track cover */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0b0e]/80 via-[#0a0b0e]/95 to-[#08090d] pointer-events-none" />

      {/* Top Navbar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span className="text-xs uppercase tracking-widest font-semibold text-zinc-400">
            Now Playing • VIBEESH
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQueueOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
            title="Open Queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsNowPlayingOpen(false)}
            aria-label="Close"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        {/* Large Artwork with Glow */}
        <div className="relative group mb-6">
          <div
            className={`absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-purple-500/30 rounded-3xl blur-2xl opacity-50 transition-opacity duration-700 ${
              isPlaying ? 'opacity-80' : 'opacity-20'
            }`}
          />
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-2xl bg-zinc-900 border border-white/10">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        </div>

        {/* Audio Visualizer Spectrum simulation */}
        <div className="flex items-end justify-center gap-1.5 h-8 mb-6">
          {[...Array(16)].map((_, i) => (
            <span
              key={i}
              className={`w-1 rounded-full bg-gradient-to-t from-emerald-500 to-purple-400 transition-all ${
                isPlaying ? `animate-bar-${(i % 4) + 1}` : 'h-1 opacity-30'
              }`}
              style={{
                height: isPlaying ? undefined : '4px',
                animationDelay: `${(i * 0.08).toFixed(2)}s`,
              }}
            />
          ))}
        </div>

        {/* Track Title and Artist */}
        <div className="w-full flex items-center justify-between gap-4 mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge sourceType={currentTrack.sourceType} isPlayable={currentTrack.isPlayable} />
              {currentTrack.genre && (
                <span className="text-[11px] text-zinc-400 px-2 py-0.5 rounded bg-white/5">
                  {currentTrack.genre}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate leading-tight">
              {currentTrack.title}
            </h1>
            <p className="text-base text-zinc-400 truncate mt-1">
              {currentTrack.artist} &bull; <span className="text-zinc-500">{currentTrack.album}</span>
            </p>
          </div>

          <button
            onClick={() => toggleLike(currentTrack)}
            aria-label={liked ? 'Unlike' : 'Like'}
            className={`p-3 rounded-full hover:bg-white/10 transition-transform active:scale-90 ${
              liked ? 'text-rose-500 scale-110' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className={`w-7 h-7 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Seekbar and Timestamps */}
        <div className="w-full space-y-2 mb-6">
          <div className="relative flex items-center">
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
          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Playback Controls */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 mb-6">
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-full transition-colors ${
              shuffle ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400 hover:text-white'
            }`}
            title={`Shuffle is ${shuffle ? 'on' : 'off'}`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={prevTrack}
            className="p-3 text-zinc-300 hover:text-white transition-transform active:scale-90"
            title="Previous track"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-xl shadow-emerald-500/30 transition-transform hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-3 text-zinc-300 hover:text-white transition-transform active:scale-90"
            title="Next track"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2.5 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume & Details Footer */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5 text-xs text-zinc-400">
          <div className="flex items-center gap-3 w-full sm:w-64">
            <button onClick={toggleMute} className="hover:text-white transition-colors">
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

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <Keyboard className="w-3.5 h-3.5" /> Space: Play/Pause &bull; &larr;/&rarr;: Seek &bull; M: Mute
            </span>
            {currentTrack.originalUrl && (
              <a
                href={currentTrack.originalUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                Source <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
