import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Sparkles, Play } from 'lucide-react';
import { MusicService } from '../services/MusicService';
import type { Track } from '../types';
import { TrackCard } from '../components/Cards/TrackCard';
import { SkeletonCard } from '../components/Common/SkeletonCard';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import { usePlayer } from '../context/PlayerContext';

interface OutletContextType {
  onOpenAddToPlaylist: (track: Track) => void;
}

export const NewReleasesPage: React.FC = () => {
  const { onOpenAddToPlaylist } = useOutletContext<OutletContextType>();
  const { playTrack } = usePlayer();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'itunes' | 'jamendo'>('all');

  const fetchNewReleases = () => {
    setLoading(true);
    setError(null);

    MusicService.getNewReleases(30)
      .then((data) => {
        setTracks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch latest releases from music providers.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNewReleases();
  }, []);

  const filteredTracks = tracks.filter((t) => {
    if (filter === 'all') return true;
    return t.provider === filter;
  });

  const handlePlayAll = () => {
    if (filteredTracks.length > 0) {
      playTrack(filteredTracks[0], filteredTracks);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
              Live Provider Discoveries
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            New Releases
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Freshly released singles, EPs, and independent tracks with verified audio previews and streams.
          </p>
        </div>

        {filteredTracks.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              Play All Releases
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pt-1 border-b border-white/5 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          All Releases ({tracks.length})
        </button>
        <button
          onClick={() => setFilter('itunes')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'itunes'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Global & Regional Singles (Apple Music)
        </button>
        <button
          onClick={() => setFilter('jamendo')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'jamendo'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Indie Releases (Jamendo CC)
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchNewReleases} />}

      {/* Grid or Jamendo Notice */}
      {filter === 'jamendo' && !loading && filteredTracks.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#141620] border border-purple-500/20 text-center max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Jamendo Client ID Required</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Jamendo's API requires a free developer Client ID for authorized streaming of Creative Commons indie tracks.
          </p>
          <div className="text-xs text-zinc-400 bg-purple-950/20 p-3 rounded-xl border border-purple-500/10 text-left">
            <p className="font-semibold text-purple-300 mb-1">Quick Setup:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-zinc-400">
              <li>Visit <a href="https://developer.jamendo.com/v3.0" target="_blank" rel="noreferrer" className="text-purple-400 underline">developer.jamendo.com</a></li>
              <li>Create a free account and register an app</li>
              <li>Open <strong>Admin Settings (🔒)</strong> in VIBEESH (Administrator sign-in required) and paste your Client ID</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {loading
            ? [...Array(12)].map((_, i) => <SkeletonCard key={i} />)
            : filteredTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  queueContext={filteredTracks}
                  onOpenAddToPlaylist={onOpenAddToPlaylist}
                />
              ))}
        </div>
      )}
    </div>
  );
};
