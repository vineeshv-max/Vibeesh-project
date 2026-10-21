import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Mic, Calendar, Clock, AlertCircle } from 'lucide-react';
import type { Podcast, PodcastEpisode, Track } from '../../types';
import { MusicService } from '../../services/MusicService';
import { usePlayer } from '../../context/PlayerContext';

interface PodcastEpisodesModalProps {
  podcast: Podcast | null;
  onClose: () => void;
}

export const PodcastEpisodesModal: React.FC<PodcastEpisodesModalProps> = ({ podcast, onClose }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!podcast) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    MusicService.getPodcastEpisodes(podcast.title, 12)
      .then((eps) => {
        if (!isMounted) return;
        setEpisodes(eps);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);
        setError('Failed to load episodes for this podcast feed.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [podcast]);

  if (!podcast) return null;

  const handlePlayEpisode = (ep: PodcastEpisode) => {
    // Convert episode to Track format for PlayerContext
    const episodeTrack: Track = {
      id: ep.id,
      title: ep.title,
      artist: podcast.title,
      album: podcast.publisher,
      duration: ep.duration,
      coverUrl: ep.coverUrl || podcast.coverUrl,
      audioUrl: ep.audioUrl,
      isPlayable: true,
      sourceType: 'podcast',
      provider: 'podcast',
      description: ep.description,
      releaseDate: ep.pubDate,
    };

    if (currentTrack?.id === ep.id) {
      togglePlay();
    } else {
      playTrack(episodeTrack);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.round(sec / 60);
    return `${mins} min`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#141620] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-b from-purple-900/30 via-[#141620] to-[#141620] border-b border-white/5 flex gap-5 items-start">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/40 text-zinc-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src={podcast.coverUrl}
            alt={podcast.title}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-2xl shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80';
            }}
          />

          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {podcast.category}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-1 truncate">
              {podcast.title}
            </h2>
            <p className="text-xs text-zinc-400 mb-2 truncate">{podcast.publisher}</p>
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {podcast.description}
            </p>
          </div>
        </div>

        {/* Episodes list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Mic className="w-3.5 h-3.5 text-purple-400" />
            Available Episodes ({episodes.length})
          </h4>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 rounded-xl bg-white/5 animate-pulse h-20" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center text-zinc-400 text-sm flex flex-col items-center">
              <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
              {error}
            </div>
          ) : episodes.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">
              No playable episode streams found in this feed.
            </p>
          ) : (
            episodes.map((ep) => {
              const isCurrentEp = currentTrack?.id === ep.id;
              const isEpPlaying = isCurrentEp && isPlaying;

              return (
                <div
                  key={ep.id}
                  onClick={() => handlePlayEpisode(ep)}
                  className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isCurrentEp
                      ? 'bg-purple-950/20 border-purple-500/40'
                      : 'bg-[#181a26]/70 hover:bg-[#1f2232] border-white/5'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayEpisode(ep);
                    }}
                    aria-label={isEpPlaying ? 'Pause' : 'Play episode'}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      isEpPlaying
                        ? 'bg-purple-500 text-white'
                        : 'bg-purple-500/20 text-purple-300 group-hover:bg-purple-500 group-hover:text-white'
                    }`}
                  >
                    {isEpPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h5
                      className={`text-sm font-semibold mb-1 truncate ${
                        isCurrentEp ? 'text-purple-300' : 'text-zinc-100 group-hover:text-white'
                      }`}
                    >
                      {ep.title}
                    </h5>
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
                      {ep.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {ep.pubDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(ep.duration)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
