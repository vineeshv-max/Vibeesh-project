import React, { useState } from 'react';
import { X, Music } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose }) => {
  const { createPlaylist } = useLibrary();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createPlaylist(name, description);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#161822] border border-white/10 rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Create New Playlist</h3>
            <p className="text-xs text-zinc-400">Add custom collections to your library</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Playlist Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Midnight Beats, Tamil Melodies"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Tell listeners what this vibe is all about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
