import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, ExternalLink } from 'lucide-react';
import { ITunesProvider } from '../services/iTunesProvider';
import type { Track } from '../types';
import { TrackRow } from '../components/Cards/TrackRow';
import { SkeletonRow } from '../components/Common/SkeletonCard';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import { usePlayer } from '../context/PlayerContext';

interface OutletContextType {
  onOpenAddToPlaylist: (track: Track) => void;
}

export const AlbumDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { onOpenAddToPlaylist } = useOutletContext<OutletContextType>();
  const { currentTrack, isPlaying, playTrack } = usePlayer();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    ITunesProvider.getAlbumTracks(id)
      .then((items) => {
        if (!isMounted) return;
        setTracks(items);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);
        setError('Failed to fetch album tracks.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const firstTrack = tracks[0];
  const albumTitle = firstTrack?.album || 'Album';
  const artistName = firstTrack?.artist || 'Artist';
  const coverUrl = firstTrack?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';

  const handlePlayAlbum = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const isPlayingThisAlbum =
    tracks.some((t) => t.id === currentTrack?.id) && isPlaying;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {error && <ErrorMessage message={error} />}

      {/* Album Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#181324] to-[#12141c] border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 shadow-2xl">
        <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shrink-0 shadow-2xl bg-zinc-900 border border-white/10">
          <img src={coverUrl} alt={albumTitle} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
          <span className="text-xs uppercase tracking-wider font-semibold text-purple-400">
            Album
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight truncate">
            {albumTitle}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-zinc-400">
            <span
              onClick={() => navigate(`/artists/${encodeURIComponent(artistName)}`)}
              className="font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors"
            >
              {artistName}
            </span>
            <span>&bull;</span>
            <span>{tracks.length} tracks</span>
            {firstTrack?.genre && (
              <>
                <span>&bull;</span>
                <span>{firstTrack.genre}</span>
              </>
            )}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <button
              onClick={handlePlayAlbum}
              disabled={tracks.length === 0}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isPlayingThisAlbum ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
              {isPlayingThisAlbum ? 'Pause' : 'Play Previews'}
            </button>
            {firstTrack?.originalUrl && (
              <a
                href={firstTrack.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur transition-all hover:scale-105"
              >
                <span>Full Album on Apple Music</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tracklist Table */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-white">Tracklist</h3>

        <div className="bg-[#12141c]/60 rounded-2xl border border-white/5 overflow-hidden">
          <div className="divide-y divide-white/[0.03] p-1">
            {loading
              ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              : tracks.map((track, idx) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={idx}
                    queueContext={tracks}
                    showAlbum={false}
                    onOpenAddToPlaylist={onOpenAddToPlaylist}
                  />
                ))}
          </div>
        </div>
      </section>
    </div>
  );
};
