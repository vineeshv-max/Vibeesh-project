import React, { useState } from 'react';
import { X, Plus, Check, ListMusic } from 'lucide-react';
import type { Track } from '../../types';
import { useLibrary } from '../../context/LibraryContext';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  onClose,
  track,
}) => {
  const { playlists, addTrackToPlaylist, createPlaylist } = useLibrary();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  if (!isOpen || !track) return null;

  const handleAddToPlaylist = (playlistId: string) => {
    addTrackToPlaylist(playlistId, track);
    setAddedIds((prev) => [...prev, playlistId]);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const created = createPlaylist(newPlaylistName);
    addTrackToPlaylist(created.id, track);
    setNewPlaylistName('');
    setIsCreating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#161822] border border-white/10 rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-white mb-1">Add to Playlist</h3>
        <p className="text-xs text-zinc-400 mb-4 truncate">
          Select playlist for <span className="text-emerald-400 font-medium">"{track.title}"</span>
        </p>

        {/* Existing playlists */}
        <div className="max-h-60 overflow-y-auto space-y-1 mb-4 pr-1">
          {playlists.map((pl) => {
            const alreadyIn = pl.tracks.some((t) => t.id === track.id) || addedIds.includes(pl.id);

            return (
              <button
                key={pl.id}
                onClick={() => handleAddToPlaylist(pl.id)}
                disabled={alreadyIn}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors text-left ${
                  alreadyIn
                    ? 'bg-emerald-500/10 text-emerald-400 cursor-default'
                    : 'hover:bg-white/5 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                    <ListMusic className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{pl.name}</p>
                    <p className="text-[11px] text-zinc-500">{pl.tracks.length} tracks</p>
                  </div>
                </div>

                {alreadyIn ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                ) : (
                  <Plus className="w-4 h-4 text-zinc-500 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick create option */}
        {isCreating ? (
          <form onSubmit={handleCreateAndAdd} className="pt-2 border-t border-white/5">
            <input
              type="text"
              autoFocus
              placeholder="New playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0e1017] border border-white/10 text-white placeholder-zinc-500 text-xs mb-2 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="px-3.5 py-1.5 bg-emerald-500 text-black font-semibold text-xs rounded-lg hover:bg-emerald-400 transition-colors"
              >
                Save & Add
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-emerald-500/40 text-zinc-400 hover:text-emerald-400 flex items-center justify-center gap-2 text-xs font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Playlist
          </button>
        )}
      </div>
    </div>
  );
};
