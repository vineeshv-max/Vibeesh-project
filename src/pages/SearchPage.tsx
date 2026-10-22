import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import {
  Search as SearchIcon,
  X,
  Music,
  Mic,
  Archive,
  Layers,
  Sparkles,
  Play,
} from 'lucide-react';
import { MusicService } from '../services/MusicService';
import type { Track, Podcast } from '../types';
import { TrackCard } from '../components/Cards/TrackCard';
import { PodcastCard } from '../components/Cards/PodcastCard';
import { SkeletonCard } from '../components/Common/SkeletonCard';
import { EmptyState } from '../components/Common/EmptyState';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import { LANGUAGES } from '../data/languages';
import { usePlayer } from '../context/PlayerContext';

interface OutletContextType {
  onOpenAddToPlaylist: (track: Track) => void;
  onSelectPodcast: (podcast: Podcast) => void;
}

type FilterType = 'all' | 'tracks' | 'podcasts' | 'cc';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialLang = searchParams.get('lang') || '';

  const { onOpenAddToPlaylist, onSelectPodcast } = useOutletContext<OutletContextType>();
  const { playTrack } = usePlayer();

  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLang);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [archiveTracks, setArchiveTracks] = useState<Track[]>([]);
  const [mbRecordings, setMbRecordings] = useState<Track[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state if URL search query changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  // Fetch search suggestions
  useEffect(() => {
    if (query.trim().length > 1) {
      MusicService.getSearchSuggestions(query.trim(), 5).then((items) => {
        setSuggestions(items);
      });
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!query.trim()) {
      setTracks([]);
      setPodcasts([]);
      setArchiveTracks([]);
      setMbRecordings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    debounceTimerRef.current = setTimeout(() => {
      let fullQuery = query.trim();
      if (selectedLanguage) {
        const langObj = LANGUAGES.find((l) => l.code === selectedLanguage);
        if (langObj) {
          fullQuery = `${fullQuery} ${langObj.name}`;
        }
      }

      MusicService.searchAll(fullQuery, filter)
        .then((res) => {
          setTracks(res.tracks);
          setPodcasts(res.podcasts);
          setArchiveTracks(res.archiveTracks);
          setMbRecordings(res.mbRecordings);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('Search request failed. Please check your network connection.');
          setLoading(false);
        });
    }, 450);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, filter, selectedLanguage]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSearchParams(val.trim() ? { q: val } : {});
  };

  const handleClear = () => {
    setQuery('');
    setSearchParams({});
  };

  const handleLanguageTagClick = (code: string) => {
    if (selectedLanguage === code) {
      setSelectedLanguage('');
    } else {
      setSelectedLanguage(code);
    }
  };

  // 1-Click playable alternative search for metadata-only MusicBrainz track
  const handleFindPlayable = async (mbTrack: Track) => {
    const playable = await MusicService.findPlayableAlternative(mbTrack);
    if (playable) {
      playTrack(playable);
    } else {
      alert(`Could not find an immediate audio stream for "${mbTrack.title}". Try searching with artist name.`);
    }
  };

  const hasResults =
    tracks.length > 0 ||
    podcasts.length > 0 ||
    archiveTracks.length > 0 ||
    mbRecordings.length > 0;

  const popularSearches = [
    'Anirudh Ravichander',
    'Arijit Singh',
    'Sushin Shyam',
    'Sid Sriram',
    'BTS',
    'Taylor Swift',
    'Bad Bunny',
    'The Daily',
    'Duke Ellington',
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Search Header and Input */}
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Search VIBEESH</h1>

        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              handleQueryChange(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search tracks, artists, albums, podcasts, or languages..."
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#141620] border border-white/10 text-white placeholder-zinc-500 text-sm sm:text-base focus:outline-none focus:border-emerald-500/60 focus:bg-[#181a26] transition-all shadow-lg"
          />
          {query && (
            <button
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowSuggestions(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#12141e] border border-white/10 rounded-2xl shadow-2xl z-30 overflow-hidden py-1.5 divide-y divide-white/5">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleQueryChange(s);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs sm:text-sm text-zinc-200 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    <SearchIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{s}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-emerald-500 text-black'
                : 'bg-[#141620] text-zinc-300 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setFilter('tracks')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filter === 'tracks'
                ? 'bg-emerald-500 text-black'
                : 'bg-[#141620] text-zinc-300 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Songs
          </button>
          <button
            onClick={() => setFilter('podcasts')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filter === 'podcasts'
                ? 'bg-purple-600 text-white'
                : 'bg-[#141620] text-zinc-300 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Podcasts
          </button>
          <button
            onClick={() => setFilter('cc')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filter === 'cc'
                ? 'bg-amber-500 text-black'
                : 'bg-[#141620] text-zinc-300 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            Archive / Full Track (CC)
          </button>
        </div>

        {/* Language Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          <span className="text-zinc-500 shrink-0 font-medium">Filter language:</span>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageTagClick(lang.code)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                selectedLanguage === lang.code
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold'
                  : 'bg-[#12141c] text-zinc-400 hover:text-zinc-200 border border-white/5'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Initial state: Popular suggestions */}
      {!query && (
        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Popular Searches & Artists
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleQueryChange(term)}
                  className="px-4 py-2 rounded-xl bg-[#141620] hover:bg-emerald-500/15 hover:text-emerald-400 border border-white/5 text-zinc-300 text-xs sm:text-sm font-medium transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/20 to-purple-950/20 border border-white/5 space-y-2">
            <h4 className="font-bold text-white text-base">Multilingual Music Search</h4>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Type any Indian or international language song, artist, or movie title (e.g. "Leo Anirudh",
              "Arijit Singh Kesariya", "Sushin Shyam", "BTS Dynamite", "Duke Ellington"). Playable
              streams and previews will appear automatically.
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4 pt-4">
          <p className="text-xs text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Searching across connected providers...
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Results view */}
      {!loading && query && !hasResults && (
        <EmptyState
          title="No tracks or podcasts found"
          description={`We couldn't find any results matching "${query}". Try checking your spelling or searching for an artist or genre name.`}
          actionLabel="Clear Search"
          onAction={handleClear}
        />
      )}

      {!loading && hasResults && (
        <div className="space-y-8 pt-2">
          {/* Songs Results */}
          {tracks.length > 0 && (filter === 'all' || filter === 'tracks') && (
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-emerald-400" />
                Songs & Previews ({tracks.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {tracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    queueContext={tracks}
                    onOpenAddToPlaylist={onOpenAddToPlaylist}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Archive / Full Length CC */}
          {archiveTracks.length > 0 && (filter === 'all' || filter === 'cc') && (
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Archive className="w-5 h-5 text-amber-400" />
                Internet Archive Full Streams ({archiveTracks.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {archiveTracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    queueContext={archiveTracks}
                    onOpenAddToPlaylist={onOpenAddToPlaylist}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Podcasts Results */}
          {podcasts.length > 0 && (filter === 'all' || filter === 'podcasts') && (
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-400" />
                Podcasts & Audio Shows ({podcasts.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {podcasts.map((podcast) => (
                  <PodcastCard
                    key={podcast.id}
                    podcast={podcast}
                    onClick={(p) => onSelectPodcast(p)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* MusicBrainz Metadata Catalog Recordings */}
          {mbRecordings.length > 0 && filter === 'all' && (
            <section className="p-5 rounded-2xl bg-[#141620] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    MusicBrainz Catalog Entries (Metadata Only)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Official encyclopedic metadata. Click "Find Playable Audio" to search for an authorized full or preview stream.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {mbRecordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-[#191b26] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-zinc-100">{rec.title}</p>
                      <p className="text-zinc-400">
                        {rec.artist} &bull; {rec.album} ({rec.releaseDate || 'Catalog'})
                      </p>
                    </div>

                    <button
                      onClick={() => handleFindPlayable(rec)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-semibold text-xs transition-colors shrink-0"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Find Playable Audio
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
