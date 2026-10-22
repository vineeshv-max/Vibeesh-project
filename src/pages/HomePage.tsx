import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Sparkles,
  Flame,
  Globe2,
  Mic,
  Music2,
  ChevronRight,
  Disc3,
  Shuffle,
} from 'lucide-react';
import { MusicService } from '../services/MusicService';
import type { Track, Podcast } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { TrackCard } from '../components/Cards/TrackCard';
import { PodcastCard } from '../components/Cards/PodcastCard';
import { LanguageCard } from '../components/Cards/LanguageCard';
import { SkeletonCard } from '../components/Common/SkeletonCard';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import { LANGUAGES } from '../data/languages';

interface OutletContextType {
  onOpenAddToPlaylist: (track: Track) => void;
  onSelectPodcast: (podcast: Podcast) => void;
  onOpenCreatePlaylist: () => void;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { onOpenAddToPlaylist, onSelectPodcast } = useOutletContext<OutletContextType>();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featured, setFeatured] = useState<Track | null>(null);
  const [trending, setTrending] = useState<Track[]>([]);
  const [archiveGems, setArchiveGems] = useState<Track[]>([]);
  const [jamendoIndie, setJamendoIndie] = useState<Track[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    MusicService.getHomeDiscovery()
      .then((data) => {
        if (!isMounted) return;
        setFeatured(data.featured);
        setTrending(data.trending);
        setArchiveGems(data.archiveGems);
        setJamendoIndie(data.jamendoIndie);
        setPodcasts(data.podcasts);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);
        setError('Failed to load music recommendations. Check your network connection.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isFeaturedPlaying = featured && currentTrack?.id === featured.id && isPlaying;

  const handleFeaturedPlay = () => {
    if (!featured) return;
    if (currentTrack?.id === featured.id) {
      togglePlay();
    } else {
      const queueToUse =
        featured.provider === 'jamendo'
          ? jamendoIndie
          : featured.provider === 'archive'
          ? archiveGems
          : trending;
      playTrack(featured, queueToUse.length > 0 ? queueToUse : [featured]);
    }
  };

  const handlePlayTrendingAll = () => {
    if (trending.length > 0) {
      playTrack(trending[0], trending);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-10 max-w-7xl mx-auto">
      {error && <ErrorMessage message={error} onRetry={() => window.location.reload()} />}

      {/* Hero Banner / Featured Spotlight */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/70 via-[#151924] to-[#1a1426] border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-semibold uppercase tracking-wider">
              <img src="/logo.jpeg" alt="VIBEESH" className="w-4 h-4 rounded-full object-cover" />
              <span>VIBEESH &bull; Feel every Beat</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Feel every Beat with <br />
              <span className="text-gradient-purple">VIBEESH</span>
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed">
              Explore authorized streams from Indian languages (Tamil, Telugu, Malayalam, Hindi, Punjabi & more)
              to global hits, Internet Archive open classics, and trending podcasts.
            </p>

            {featured && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <button
                  onClick={handleFeaturedPlay}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  {isFeaturedPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                  {isFeaturedPlaying
                    ? 'Pause Featured'
                    : featured.sourceType === 'full'
                    ? `Play Full Song: ${featured.title}`
                    : `Play: ${featured.title}`}
                </button>

                <button
                  onClick={handlePlayTrendingAll}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur transition-all hover:scale-105"
                >
                  <Shuffle className="w-4 h-4 text-emerald-400" />
                  Shuffle Trending
                </button>
              </div>
            )}
          </div>

          {/* Featured Album Graphic */}
          {featured && (
            <div className="relative group shrink-0">
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl bg-zinc-900 border border-white/10 transform rotate-1 group-hover:rotate-0 transition-transform duration-500">
                <img
                  src={featured.coverUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-xs text-white flex items-center gap-2 shadow-xl">
                <Disc3 className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                <span className="font-semibold truncate max-w-[140px]">{featured.artist}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick Language Jumps */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Browse by Language
            </h2>
          </div>
          <button
            onClick={() => navigate('/languages')}
            className="text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            All 12+ Languages <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {LANGUAGES.slice(0, 6).map((lang) => (
            <LanguageCard key={lang.code} language={lang} />
          ))}
        </div>
      </section>

      {/* Trending Tracks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Trending Right Now
              </h2>
              <p className="text-xs text-zinc-400">Popular chart hits with audio preview streaming</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/trending')}
            className="text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            See Top 25 <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {loading
            ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
            : trending
                .slice(0, 6)
                .map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    queueContext={trending}
                    onOpenAddToPlaylist={onOpenAddToPlaylist}
                  />
                ))}
        </div>
      </section>

      {/* Creative Commons & Archive Gems */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Internet Archive & Open Music
              </h2>
              <p className="text-xs text-zinc-400">
                Full-length streaming public domain & Creative Commons recordings
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {loading
            ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
            : archiveGems.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  queueContext={archiveGems}
                  onOpenAddToPlaylist={onOpenAddToPlaylist}
                />
              ))}
        </div>
      </section>

      {/* Jamendo Indie Highlights */}
      {jamendoIndie.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Jamendo Indie Spotlights
                </h2>
                <p className="text-xs text-zinc-400">
                  Full length Creative Commons indie music
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {jamendoIndie.slice(0, 6).map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                queueContext={jamendoIndie}
                onOpenAddToPlaylist={onOpenAddToPlaylist}
              />
            ))}
          </div>
        </section>
      )}

      {/* Podcasts Carousel / Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Popular Podcasts & Shows
              </h2>
              <p className="text-xs text-zinc-400">Click any podcast to stream real episodes</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/podcasts')}
            className="text-xs sm:text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            Explore All Podcasts <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {loading
            ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
            : podcasts.map((pod) => (
                <PodcastCard
                  key={pod.id}
                  podcast={pod}
                  onClick={(p) => onSelectPodcast(p)}
                />
              ))}
        </div>
      </section>
    </div>
  );
};
