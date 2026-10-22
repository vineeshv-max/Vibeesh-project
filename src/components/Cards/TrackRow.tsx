import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical, Plus, ListPlus, Radio, ExternalLink } from 'lucide-react';
import type { Track } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from '../Common/Badge';
import { useNavigate } from 'react-router-dom';

interface TrackRowProps {
  track: Track;
  index: number;
  queueContext?: Track[];
  onOpenAddToPlaylist?: (track: Track) => void;
  showAlbum?: boolean;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  queueContext,
  onOpenAddToPlaylist,
  showAlbum = true,
}) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue } = usePlayer();
  const { isLiked, toggleLike } = useLibrary();
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isThisPlaying = isCurrent && isPlaying;
  const liked = isLiked(track.id);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = Math.floor(sec % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleRowClick = () => {
    if (!track.isPlayable) return;
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queueContext);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(track);
  };

  const handleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
        isCurrent
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'hover:bg-white/5 text-zinc-300 border border-transparent'
      }`}
    >
      {/* Index or Play icon */}
      <div className="w-7 flex items-center justify-center shrink-0">
        {isThisPlaying ? (
          <div className="flex items-end gap-0.5 h-4">
            <span className="w-0.5 bg-emerald-400 rounded-full animate-bar-1" />
            <span className="w-0.5 bg-emerald-400 rounded-full animate-bar-2" />
            <span className="w-0.5 bg-emerald-400 rounded-full animate-bar-3" />
          </div>
        ) : (
          <>
            <span className="text-xs text-zinc-500 group-hover:hidden font-mono">
              {index + 1}
            </span>
            {track.isPlayable ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowClick();
                }}
                className="hidden group-hover:flex text-white hover:text-emerald-400 transition-colors"
                aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
              >
                {isCurrent && isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            ) : (
              <span className="text-[10px] text-zinc-600 group-hover:block hidden font-mono">
                —
              </span>
            )}
          </>
        )}
      </div>

      {/* Cover Image */}
      <img
        src={track.coverUrl}
        alt={track.title}
        loading="lazy"
        className="w-10 h-10 rounded-lg object-cover bg-zinc-900 shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80';
        }}
      />

      {/* Title & Artist */}
      <div className="flex-1 min-w-0 pr-2">
        <p
          className={`text-sm font-medium truncate ${
            isCurrent ? 'text-emerald-400 font-semibold' : 'text-zinc-100 group-hover:text-white'
          }`}
        >
          {track.title}
        </p>
        <p
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/artists/${encodeURIComponent(track.artist)}`);
          }}
          className="text-xs text-zinc-400 hover:text-emerald-400 truncate hover:underline transition-colors w-fit"
        >
          {track.artist}
        </p>
      </div>

      {/* Album Name (Desktop) */}
      {showAlbum && (
        <div className="hidden md:block w-1/4 text-xs text-zinc-400 truncate pr-2">
          {track.album}
        </div>
      )}

      {/* Badge */}
      <div className="hidden sm:block shrink-0">
        <Badge sourceType={track.sourceType} isPlayable={track.isPlayable} />
      </div>

      {/* Like button */}
      <button
        onClick={handleLike}
        aria-label={liked ? 'Unlike' : 'Like'}
        className={`p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0 ${
          liked ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100'
        }`}
      >
        <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
      </button>

      {/* Duration */}
      <span
        className={`text-xs font-mono w-12 text-right shrink-0 ${
          track.sourceType === 'preview' ? 'text-blue-400/80 font-medium' : 'text-zinc-500'
        }`}
        title={track.sourceType === 'preview' ? '30-second official preview clip' : undefined}
      >
        {track.sourceType === 'preview' ? '0:30' : formatDuration(track.duration || 180)}
      </span>

      {/* More Options */}
      <div className="relative shrink-0">
        <button
          onClick={handleMenu}
          aria-label="More options"
          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
              }}
            />
            <div className="absolute right-0 top-full mt-1 w-44 bg-[#1e212b] border border-white/10 rounded-xl shadow-2xl z-40 py-1.5 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToQueue(track);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors text-left"
              >
                <ListPlus className="w-3.5 h-3.5" />
                Add to Queue
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  if (onOpenAddToPlaylist) onOpenAddToPlaylist(track);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors text-left"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Playlist
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/artists/${encodeURIComponent(track.artist)}`);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors text-left"
              >
                <Radio className="w-3.5 h-3.5" />
                Go to Artist
              </button>
              {track.originalUrl && (
                <a
                  href={track.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-blue-400 hover:bg-blue-500/10 transition-colors text-left"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {track.sourceType === 'preview' ? 'Full on Apple Music' : 'Open on Platform'}
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
