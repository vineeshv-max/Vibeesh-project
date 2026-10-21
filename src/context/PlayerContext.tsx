import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Track } from '../types';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Track[];
  queueIndex: number;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  error: string | null;
  isNowPlayingOpen: boolean;
  isQueueOpen: boolean;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  pause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setIsNowPlayingOpen: (open: boolean) => void;
  setIsQueueOpen: (open: boolean) => void;
  clearError: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem('vibeesh_player_volume') || localStorage.getItem('melodyverse_player_volume');
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [error, setError] = useState<string | null>(null);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;
    audioRef.current = audio;

    const onCanPlay = () => {
      setIsLoading(false);
    };

    const onWaiting = () => {
      setIsLoading(true);
    };

    const onPlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onTimeUpdate = () => {
      if (audio.currentTime) {
        setCurrentTime(audio.currentTime);
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('Unable to stream this audio track. Skipping to next playable source...');
      console.warn('Audio stream error on URL:', audio.src);
    };

    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    localStorage.setItem('vibeesh_player_volume', volume.toString());
  }, [volume, isMuted]);

  // Handle Play Track
  const playTrack = useCallback(
    (track: Track, newQueue?: Track[]) => {
      if (!audioRef.current) return;
      setError(null);

      if (!track.isPlayable || !track.audioUrl) {
        setError(`"${track.title}" is metadata-only and has no authorized audio stream.`);
        return;
      }

      setCurrentTrack(track);
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(track.duration || 0);

      // If newQueue passed, replace queue
      if (newQueue && newQueue.length > 0) {
        setQueue(newQueue);
        const idx = newQueue.findIndex((t) => t.id === track.id);
        setQueueIndex(idx >= 0 ? idx : 0);
      } else {
        // If track not in current queue, append or make it single
        setQueue((prevQueue) => {
          const exists = prevQueue.findIndex((t) => t.id === track.id);
          if (exists >= 0) {
            setQueueIndex(exists);
            return prevQueue;
          } else {
            const updated = [...prevQueue, track];
            setQueueIndex(updated.length - 1);
            return updated;
          }
        });
      }

      audioRef.current.src = track.audioUrl;
      audioRef.current.load();

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Playback initiation error:', err);
          setIsLoading(false);
          setIsPlaying(false);
          setError('Playback was prevented or source is unreachable. Click play to retry.');
        });
      }
    },
    []
  );

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Playback error:', err);
          setError('Playback could not resume.');
        });
      }
    }
  }, [isPlaying, currentTrack]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (shuffle) {
      // Pick random index not equal to current
      if (queue.length > 1) {
        do {
          nextIdx = Math.floor(Math.random() * queue.length);
        } while (nextIdx === queueIndex);
      } else {
        nextIdx = 0;
      }
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        // Queue finished
        pause();
        return;
      }
    }

    const nextPlayable = queue[nextIdx];
    if (nextPlayable) {
      playTrack(nextPlayable);
    }
  }, [queue, queueIndex, shuffle, repeatMode, pause, playTrack]);

  const prevTrack = useCallback(() => {
    if (!audioRef.current) return;

    // If more than 3 seconds in, restart current track
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (queue.length === 0) return;

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = repeatMode === 'all' ? queue.length - 1 : 0;
    }

    const prevPlayable = queue[prevIdx];
    if (prevPlayable) {
      playTrack(prevPlayable);
    }
  }, [queue, queueIndex, repeatMode, playTrack]);

  // Handle track ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('ended', onEnded);
    };
  }, [repeatMode, nextTrack]);

  const seekTo = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(-1);
    }
  }, [currentTrack]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        nextTrack();
      } else if (e.code === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        prevTrack();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (audioRef.current) seekTo(Math.min(duration, currentTime + 5));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (audioRef.current) seekTo(Math.max(0, currentTime - 5));
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextTrack, prevTrack, seekTo, currentTime, duration, toggleMute]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        volume,
        isMuted,
        queue,
        queueIndex,
        shuffle,
        repeatMode,
        error,
        isNowPlayingOpen,
        isQueueOpen,
        playTrack,
        togglePlay,
        pause,
        nextTrack,
        prevTrack,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setIsNowPlayingOpen,
        setIsQueueOpen,
        clearError,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
