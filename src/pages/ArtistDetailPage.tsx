import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { Play, Pause, CheckCircle2, Music, ArrowLeft } from 'lucide-react';
import { MusicService } from '../services/MusicService';
import type { Artist, Track } from '../types';
import { TrackRow } from '../components/Cards/TrackRow';
import { SkeletonRow } from '../components/Common/SkeletonCard';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import { usePlayer } from '../context/PlayerContext';

interface OutletContextType {
  onOpenAddToPlaylist: (track: Track) => void;
}

export const ArtistDetailPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const artistName = decodeURIComponent(name || '');

  const { onOpenAddToPlaylist } = useOutletContext<OutletContextType>();
  const { currentTrack, isPlaying, playTrack } = usePlayer();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistName) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    MusicService.getArtistDetail(artistName)
      .then((data) => {
        if (!isMounted) return;
        setArtist(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);
        setError(`Failed to fetch details for ${artistName}`);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [artistName]);

  const handlePlayAll = () => {
    if (artist && artist.topTracks.length > 0) {
      playTrack(artist.topTracks[0], artist.topTracks);
    }
  };

  const isPlayingArtist =
    artist &&
    artist.topTracks.some((t) => t.id === currentTrack?.id) &&
    isPlaying;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {error && <ErrorMessage message={error} />}

      {/* Artist Hero Header */}
      {artist && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#161a24] to-[#12141c] border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shrink-0 shadow-2xl bg-zinc-900 border-2 border-white/10">
            <img
              src={artist.image}
              alt={artist.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Artist
              </span>
              <span className="text-xs text-zinc-400">{artist.genre}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight truncate">
              {artist.name}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl line-clamp-3 leading-relaxed">
              {artist.bio}
            </p>

            <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
              <button
                onClick={handlePlayAll}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              >
                {isPlayingArtist ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
                {isPlayingArtist ? 'Pause' : 'Play All Tracks'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Tracks */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Music className="w-5 h-5 text-emerald-400" />
          Popular Songs by {artistName}
        </h3>

        <div className="bg-[#12141c]/60 rounded-2xl border border-white/5 overflow-hidden">
          <div className="divide-y divide-white/[0.03] p-1">
            {loading
              ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              : artist?.topTracks.map((track, idx) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={idx}
                    queueContext={artist.topTracks}
                    onOpenAddToPlaylist={onOpenAddToPlaylist}
                  />
                ))}
          </div>
        </div>
      </section>
    </div>
  );
};
