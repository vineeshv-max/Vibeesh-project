import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical, Plus, ListPlus, Radio, ExternalLink } from 'lucide-react';
import type { Track } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from '../Common/Badge';
import { useNavigate } from 'react-router-dom';

interface TrackCardProps {
  track: Track;
  queueContext?: Track[];
  onOpenAddToPlaylist?: (track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  queueContext,
  onOpenAddToPlaylist,
}) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue } = usePlayer();
  const { isLiked, toggleLike } = useLibrary();
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isThisPlaying = isCurrent && isPlaying;
  const liked = isLiked(track.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!track.isPlayable) return;

    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queueContext);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(track);
  };

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/artists/${encodeURIComponent(track.artist)}`);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(track);
    setShowMenu(false);
  };

  const handleAddToPlaylistAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onOpenAddToPlaylist) {
      onOpenAddToPlaylist(track);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group relative flex flex-col p-3 rounded-2xl transition-all duration-300 cursor-pointer border ${
        isCurrent
          ? 'bg-[#1b1f2b] border-emerald-500/40 shadow-lg shadow-emerald-950/30'
          : 'bg-[#13151c]/90 hover:bg-[#181b24] border-white/5 hover:border-white/10 hover:shadow-xl hover:shadow-black/50'
      }`}
    >
      {/* Artwork container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 mb-3 shadow-md">
        <img
          src={track.coverUrl}
          alt={track.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Ambient shadow gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play / Pause button overlay */}
        {track.isPlayable ? (
          <button
            onClick={handlePlayClick}
            aria-label={isThisPlaying ? 'Pause' : 'Play'}
            className={`absolute bottom-3 right-3 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isThisPlaying
                ? 'bg-emerald-500 text-black opacity-100 scale-100'
                : 'bg-emerald-500 text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110 active:scale-95'
            }`}
          >
            {isThisPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        ) : (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur rounded text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
            No Stream
          </div>
        )}

        {/* Playing equalizer bars badge */}
        {isThisPlaying && (
          <div className="absolute top-2.5 left-2.5 flex items-end gap-0.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded-full">
            <span className="w-1 bg-emerald-400 rounded-full animate-bar-1" />
            <span className="w-1 bg-emerald-400 rounded-full animate-bar-2" />
            <span className="w-1 bg-emerald-400 rounded-full animate-bar-3" />
            <span className="w-1 bg-emerald-400 rounded-full animate-bar-4" />
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h4
            className={`font-semibold text-sm truncate ${
              isCurrent ? 'text-emerald-400' : 'text-zinc-100 group-hover:text-white'
            }`}
            title={track.title}
          >
            {track.title}
          </h4>

          {/* Quick Like button */}
          <button
            onClick={handleLikeClick}
            aria-label={liked ? 'Unlike' : 'Like'}
            className={`p-1 -mr-1 rounded-full hover:bg-white/10 transition-colors shrink-0 ${
              liked ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        <button
          onClick={handleArtistClick}
          className="text-xs text-zinc-400 hover:text-emerald-400 text-left truncate transition-colors mb-2"
          title={track.artist}
        >
          {track.artist}
        </button>

        {/* Footer row: Badge & Menu */}
        <div className="mt-auto pt-1 flex items-center justify-between">
          <Badge sourceType={track.sourceType} isPlayable={track.isPlayable} />

          <div className="relative">
            <button
              onClick={handleMenuClick}
              aria-label="Options"
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 bottom-full mb-1 w-44 bg-[#1e212b] border border-white/10 rounded-xl shadow-2xl z-40 py-1.5 text-xs">
                  <button
                    onClick={handleAddToQueue}
                    className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-white hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    Add to Queue
                  </button>
                  <button
                    onClick={handleAddToPlaylistAction}
                    className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-white hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to Playlist
                  </button>
                  <button
                    onClick={handleArtistClick}
                    className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-white hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left"
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
      </div>
    </div>
  );
};
