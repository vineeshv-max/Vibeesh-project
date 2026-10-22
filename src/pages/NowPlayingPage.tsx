import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Disc3,
  ArrowLeft,
  Radio,
  ExternalLink,
  Mic2,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { Badge } from '../components/Common/Badge';
import { MusicService } from '../services/MusicService';
import type { LyricsResponse } from '../services/LrcLibProvider';

export const NowPlayingPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
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

  const [showLyrics, setShowLyrics] = useState<boolean>(false);
  const [lyrics, setLyrics] = useState<LyricsResponse | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState<boolean>(false);
  const activeLyricRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (!currentTrack) {
      setLyrics(null);
      return;
    }
    let isMounted = true;
    setLoadingLyrics(true);
    MusicService.getLyrics(
      currentTrack.title,
      currentTrack.artist,
      currentTrack.album,
      currentTrack.duration
    )
      .then((res) => {
        if (isMounted) setLyrics(res);
      })
      .catch(() => {
        if (isMounted) setLyrics(null);
      })
      .finally(() => {
        if (isMounted) setLoadingLyrics(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentTrack]);

  useEffect(() => {
    if (showLyrics && activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime, showLyrics]);

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center max-w-md mx-auto my-12">
        <Disc3 className="w-16 h-16 text-emerald-400 mb-4 animate-spin-slow" />
        <h2 className="text-xl font-bold text-white mb-2">Nothing is playing right now</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Pick a song or podcast from the home feed or search to start streaming.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all"
        >
          Explore Music
        </button>
      </div>
    );
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
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-6 sm:p-10 max-w-4xl mx-auto">
      {/* Blurred artwork ambient background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 pointer-events-none"
        style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
      />

      <div className="relative z-10 w-full flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLyrics(!showLyrics)}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              showLyrics
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white'
            }`}
            title={showLyrics ? 'Show Artwork' : 'Show Live Lyrics'}
          >
            {showLyrics ? (
              <>
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Cover</span>
              </>
            ) : (
              <>
                <Mic2 className="w-3.5 h-3.5" />
                <span>Lyrics</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-pulse" />
            Playing on VIBEESH
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
        {/* Artwork or Lyrics Container */}
        {showLyrics ? (
          <div className="w-full h-72 sm:h-80 overflow-y-auto rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-xl p-6 flex flex-col items-center mb-8 shadow-2xl relative scroll-smooth">
            <div className="sticky top-0 w-full text-center pb-2.5 mb-2 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md z-10 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>LRCLIB Lyrics</span>
              <span>{lyrics?.syncedLyrics ? 'Synchronized • Click line to seek' : 'Plain Text'}</span>
            </div>

            {loadingLyrics ? (
              <div className="flex flex-col items-center justify-center my-auto text-zinc-400 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                <span className="text-xs">Fetching lyrics from LRCLIB...</span>
              </div>
            ) : lyrics?.parsedLines && lyrics.parsedLines.length > 0 ? (
              <div className="space-y-4 text-center w-full py-4">
                {lyrics.parsedLines.map((line, idx) => {
                  const nextLine = lyrics.parsedLines![idx + 1];
                  const isActive =
                    currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
                  return (
                    <p
                      key={idx}
                      ref={isActive ? activeLyricRef : null}
                      onClick={() => seekTo(line.time)}
                      className={`cursor-pointer transition-all duration-300 select-none ${
                        isActive
                          ? 'text-emerald-400 text-lg sm:text-xl font-extrabold scale-105 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                          : 'text-zinc-500 hover:text-zinc-300 text-sm sm:text-base font-medium'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>
            ) : lyrics?.plainLyrics ? (
              <div className="text-center text-zinc-300 whitespace-pre-line text-sm sm:text-base leading-relaxed my-auto py-4">
                {lyrics.plainLyrics}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center my-auto text-zinc-500 text-xs text-center px-4">
                <p className="font-semibold text-zinc-400 mb-1">No lyrics found for this song</p>
                <p>LRCLIB does not have matching lyrics for &ldquo;{currentTrack.title}&rdquo; yet.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative group mb-8">
            <div
              className={`absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-purple-500/30 rounded-3xl blur-2xl opacity-40 transition-opacity duration-700 ${
                isPlaying ? 'opacity-70' : 'opacity-20'
              }`}
            />
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl bg-zinc-900 border border-white/10">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          </div>
        )}

        {/* Visualizer bars */}
        <div className="flex items-end justify-center gap-1.5 h-6 mb-6">
          {[...Array(12)].map((_, i) => (
            <span
              key={i}
              className={`w-1 rounded-full bg-gradient-to-t from-emerald-500 to-purple-400 transition-all ${
                isPlaying ? `animate-bar-${(i % 4) + 1}` : 'h-1 opacity-30'
              }`}
            />
          ))}
        </div>

        {/* Track Info */}
        <div className="w-full flex items-center justify-between gap-4 mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge sourceType={currentTrack.sourceType} isPlayable={currentTrack.isPlayable} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate leading-tight">
              {currentTrack.title}
            </h1>
            <p className="text-sm text-zinc-400 truncate mt-0.5">
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
            <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Preview Notice & Official Platform Streaming Option */}
        {currentTrack.sourceType === 'preview' && (
          <div className="w-full p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs mb-6 text-blue-200 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
              <span>
                Playing 30-second official preview clip. Listen to the full song on its official platform:
              </span>
            </div>
            {currentTrack.originalUrl && (
              <a
                href={currentTrack.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-black font-semibold text-xs shadow-md transition-all shrink-0 hover:scale-105 active:scale-95"
              >
                <span>Listen Full Song</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Full-Length CC Track Notice */}
        {currentTrack.sourceType === 'full' && (
          <div className="w-full p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between gap-2 text-xs mb-6 text-emerald-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>Full-length independent music legally authorized under Creative Commons via Jamendo.</span>
            </div>
            {currentTrack.originalUrl && (
              <a
                href={currentTrack.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1 shrink-0"
              >
                <span>Track Details</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Seekbar */}
        <div className="w-full space-y-1.5 mb-6">
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
          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 mb-6">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition-colors ${
              shuffle ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button onClick={prevTrack} className="p-3 text-zinc-300 hover:text-white transition-colors">
            <SkipBack className="w-6 h-6 fill-current" />
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

          <button onClick={nextTrack} className="p-3 text-zinc-300 hover:text-white transition-colors">
            <SkipForward className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume */}
        <div className="w-full flex items-center gap-3 pt-4 border-t border-white/5">
          <button onClick={toggleMute} className="text-zinc-400 hover:text-white">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
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
  );
};
