import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Flame, Play } from 'lucide-react';
import { MusicService } from '../services/MusicService';
import type { Track } from '../types';
import { TrackRow } from '../components/Cards/TrackRow';
import { SkeletonRow } from '../components/Common/SkeletonCard';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import { usePlayer } from '../context/PlayerContext';

interface OutletContextType {
  onOpenAddToPlaylist: (track: Track) => void;
}

export const TrendingPage: React.FC = () => {
  const { onOpenAddToPlaylist } = useOutletContext<OutletContextType>();
  const { playTrack } = usePlayer();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState('pop');

  const genres = [
    { id: 'pop', label: 'Top 40 Pop' },
    { id: 'hip-hop', label: 'Hip-Hop & R&B' },
    { id: 'electronic', label: 'Dance & EDM' },
    { id: 'indie', label: 'Indie & Alternative' },
    { id: 'rock', label: 'Rock Classics' },
  ];

  const fetchTrending = (genre: string) => {
    setLoading(true);
    setError(null);

    MusicService.getTrendingTracks(genre, 25)
      .then((data) => {
        setTracks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch trending chart hits.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrending(selectedGenre);
  }, [selectedGenre]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/40 via-[#18121f] to-[#12141c] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            Live Global & Regional Charts
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trending Charts
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Ranked popular tracks featuring full-length Creative Commons music and official previews with full streaming options.
          </p>
        </div>

        {tracks.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayAll}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              Play Chart
            </button>
          </div>
        )}
      </div>

      {/* Genre Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {genres.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGenre(g.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-colors ${
              selectedGenre === g.id
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'bg-[#141620] text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} onRetry={() => fetchTrending(selectedGenre)} />}

      {/* Track List Table */}
      <div className="bg-[#12141c]/60 rounded-2xl border border-white/5 overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center gap-3 px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/5">
          <span className="w-7 text-center">#</span>
          <span className="w-10"></span>
          <span className="flex-1">Title & Artist</span>
          <span className="hidden md:block w-1/4">Album</span>
          <span className="hidden sm:block">Source</span>
          <span className="w-10 text-right">Time</span>
          <span className="w-6"></span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.03] p-1">
          {loading
            ? [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
            : tracks.map((track, idx) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={idx}
                  queueContext={tracks}
                  onOpenAddToPlaylist={onOpenAddToPlaylist}
                />
              ))}
        </div>
      </div>
    </div>
  );
};
