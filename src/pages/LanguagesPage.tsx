import React, { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import {
  Globe2,
  Sparkles,
  Play,
  Heart,
  Check,
  Mic,
  Flame,
} from 'lucide-react';
import { LANGUAGES } from '../data/languages';
import { MusicService } from '../services/MusicService';
import type { Track, Podcast, LanguageOption } from '../types';
import { TrackCard } from '../components/Cards/TrackCard';
import { PodcastCard } from '../components/Cards/PodcastCard';
import { SkeletonCard } from '../components/Common/SkeletonCard';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';

interface OutletContextType {
  onOpenAddToPlaylist: (track: Track) => void;
  onSelectPodcast: (podcast: Podcast) => void;
}

export const LanguagesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const langCodeParam = searchParams.get('code') || 'ta';

  const { onOpenAddToPlaylist, onSelectPodcast } = useOutletContext<OutletContextType>();
  const { isPreferredLanguage, togglePreferredLanguage } = useLibrary();
  const { playTrack } = usePlayer();

  const [currentLang, setCurrentLang] = useState<LanguageOption>(() => {
    const found = LANGUAGES.find((l) => l.code === langCodeParam);
    return found || LANGUAGES[0];
  });

  const [tracks, setTracks] = useState<Track[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const found = LANGUAGES.find((l) => l.code === langCodeParam);
    if (found && found.code !== currentLang.code) {
      setCurrentLang(found);
    }
  }, [langCodeParam]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const tracksPromise = MusicService.getTracksByLanguage(currentLang.code, 18);
    const podcastsPromise = MusicService.getPodcastsByCategory(`${currentLang.name} podcast`, 6);

    Promise.all([tracksPromise, podcastsPromise])
      .then(([tracksRes, podsRes]) => {
        if (!isMounted) return;
        setTracks(tracksRes);
        setPodcasts(podsRes);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);
        setError(`Failed to load ${currentLang.name} music streams.`);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentLang]);

  const handleSelectLanguage = (lang: LanguageOption) => {
    setCurrentLang(lang);
    setSearchParams({ code: lang.code });
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const isPref = isPreferredLanguage(currentLang.code);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Languages Carousel / Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Multilingual Universe
            </h1>
          </div>
          <span className="text-xs text-zinc-400">12 Major Languages Supported</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold shrink-0 transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${lang.accentColor} text-white shadow-xl scale-105 border border-white/20`
                    : 'bg-[#141620] hover:bg-[#1a1c28] text-zinc-300 border border-white/5'
                }`}
              >
                <span className="font-bold text-sm">{lang.nativeName}</span>
                <span className="opacity-80">({lang.name})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Language Hero Card */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl bg-gradient-to-r ${currentLang.accentColor}`}
      >
        {/* Giant Watermark Script */}
        <span className="absolute -bottom-8 -right-4 text-9xl font-black text-white/10 select-none pointer-events-none">
          {currentLang.nativeName}
        </span>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur text-white text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Regional & Language Spotlight
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {currentLang.nativeName} &bull; {currentLang.name} Hits
            </h2>
            <p className="text-white/90 text-sm leading-relaxed font-light">
              {currentLang.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {tracks.length > 0 && (
              <button
                onClick={handlePlayAll}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                Play All {currentLang.name}
              </button>
            )}

            <button
              onClick={() => togglePreferredLanguage(currentLang.code)}
              className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-xs font-semibold backdrop-blur transition-all ${
                isPref
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-black/40 hover:bg-black/60 text-white'
              }`}
            >
              {isPref ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
              {isPref ? 'Preferred Language' : 'Pin to Favorites'}
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Language Songs Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Top {currentLang.name} Songs & Releases ({tracks.length})
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {loading
            ? [...Array(12)].map((_, i) => <SkeletonCard key={i} />)
            : tracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  queueContext={tracks}
                  onOpenAddToPlaylist={onOpenAddToPlaylist}
                />
              ))}
        </div>
      </section>

      {/* Regional Podcasts */}
      {podcasts.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              {currentLang.name} Podcasts & Audio Discussions
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {podcasts.map((pod) => (
              <PodcastCard
                key={pod.id}
                podcast={pod}
                onClick={(p) => onSelectPodcast(p)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
