import React, { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext, useNavigate } from 'react-router-dom';
import {
  Heart,
  ListMusic,
  History,
  Plus,
  Play,
  Trash2,
  Edit2,
  Music,
  Check,
  Globe2,
  Download,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import type { Track, Playlist } from '../types';
import { TrackRow } from '../components/Cards/TrackRow';
import { EmptyState } from '../components/Common/EmptyState';
import { LANGUAGES } from '../data/languages';

interface OutletContextType {
  onOpenAddToPlaylist: (track: Track) => void;
  onOpenCreatePlaylist: () => void;
  onOpenPlaylistImporter: () => void;
  onOpenYouTubeEmbed: (track: Track) => void;
}

type TabType = 'liked' | 'playlists' | 'recent' | 'languages';

export const LibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'liked';
  const playlistIdParam = searchParams.get('playlistId');

  const navigate = useNavigate();
  const { onOpenAddToPlaylist, onOpenCreatePlaylist, onOpenPlaylistImporter } =
    useOutletContext<OutletContextType>();
  const {
    likedTracks,
    playlists,
    recentlyPlayed,
    preferredLanguages,
    deletePlaylist,
    renamePlaylist,
    removeTrackFromPlaylist,
    togglePreferredLanguage,
  } = useLibrary();

  const { playTrack } = usePlayer();

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(playlistIdParam);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab) setActiveTab(tab);
    const plId = searchParams.get('playlistId');
    if (plId) {
      setSelectedPlaylistId(plId);
      setActiveTab('playlists');
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handlePlayLiked = () => {
    if (likedTracks.length > 0) {
      playTrack(likedTracks[0], likedTracks);
    }
  };

  const handlePlayPlaylist = (pl: Playlist) => {
    if (pl.tracks.length > 0) {
      playTrack(pl.tracks[0], pl.tracks);
    }
  };

  const startEditing = (pl: Playlist) => {
    setEditingPlaylistId(pl.id);
    setEditingName(pl.name);
  };

  const saveEditing = (id: string) => {
    if (editingName.trim()) {
      renamePlaylist(id, editingName.trim());
    }
    setEditingPlaylistId(null);
  };

  const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Your Library
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Persisted in browser guest mode &bull; No login required
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenPlaylistImporter}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shrink-0 border border-white/10"
            title="Import playlist from Spotify, Apple Music, JioSaavn, or YouTube Music"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Import Playlist</span>
          </button>

          <button
            onClick={onOpenCreatePlaylist}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Playlist</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => handleTabChange('liked')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
            activeTab === 'liked'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4 fill-current" />
          Liked Songs ({likedTracks.length})
        </button>

        <button
          onClick={() => handleTabChange('playlists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
            activeTab === 'playlists'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ListMusic className="w-4 h-4" />
          Playlists ({playlists.length})
        </button>

        <button
          onClick={() => handleTabChange('recent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
            activeTab === 'recent'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          Recently Played ({recentlyPlayed.length})
        </button>

        <button
          onClick={() => handleTabChange('languages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
            activeTab === 'languages'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          Saved Languages ({preferredLanguages.length})
        </button>
      </div>

      {/* Tab: Liked Songs */}
      {activeTab === 'liked' && (
        <div className="space-y-4">
          {likedTracks.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No liked songs yet"
              description="Heart songs anywhere across VIBEESH to collect your favorites here!"
              actionLabel="Discover Music"
              onAction={() => navigate('/trending')}
            />
          ) : (
            <>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-rose-950/30 via-[#18141e] to-[#12141c] border border-white/5">
                <div>
                  <h3 className="font-bold text-white text-base">Your Liked Collection</h3>
                  <p className="text-xs text-zinc-400">{likedTracks.length} favorite songs</p>
                </div>
                <button
                  onClick={handlePlayLiked}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rose-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  Play All Liked
                </button>
              </div>

              <div className="bg-[#12141c]/60 rounded-2xl border border-white/5 overflow-hidden">
                <div className="divide-y divide-white/[0.03] p-1">
                  {likedTracks.map((track, idx) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={idx}
                      queueContext={likedTracks}
                      onOpenAddToPlaylist={onOpenAddToPlaylist}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab: Playlists */}
      {activeTab === 'playlists' && (
        <div className="space-y-6">
          {selectedPlaylistId && activePlaylist ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedPlaylistId(null)}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                &larr; Back to all playlists
              </button>

              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/30 via-[#141a24] to-[#12141c] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Playlist
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    {activePlaylist.name}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1 max-w-lg">
                    {activePlaylist.description} &bull; {activePlaylist.tracks.length} tracks
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {activePlaylist.tracks.length > 0 && (
                    <button
                      onClick={() => handlePlayPlaylist(activePlaylist)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                      Play Playlist
                    </button>
                  )}
                  {activePlaylist.isCustom && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete playlist "${activePlaylist.name}"?`)) {
                          deletePlaylist(activePlaylist.id);
                          setSelectedPlaylistId(null);
                        }
                      }}
                      className="p-2.5 rounded-full hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Delete Playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {activePlaylist.tracks.length === 0 ? (
                <EmptyState
                  icon={Music}
                  title="Playlist is empty"
                  description="Search for tracks or browse trending hits and choose 'Add to Playlist' to fill this list!"
                  actionLabel="Find Music"
                  onAction={() => navigate('/search')}
                />
              ) : (
                <div className="bg-[#12141c]/60 rounded-2xl border border-white/5 overflow-hidden">
                  <div className="divide-y divide-white/[0.03] p-1">
                    {activePlaylist.tracks.map((track, idx) => (
                      <div key={track.id} className="relative group">
                        <TrackRow
                          track={track}
                          index={idx}
                          queueContext={activePlaylist.tracks}
                          onOpenAddToPlaylist={onOpenAddToPlaylist}
                        />
                        <button
                          onClick={() => removeTrackFromPlaylist(activePlaylist.id, track.id)}
                          className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className="group relative p-4 rounded-2xl bg-[#13151c] hover:bg-[#181b24] border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer shadow-lg hover:shadow-xl"
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 mb-3 shadow">
                    <img
                      src={
                        pl.tracks[0]?.coverUrl ||
                        pl.coverUrl ||
                        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={pl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {editingPlaylistId === pl.id ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 mb-1"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-2 py-1 bg-zinc-900 border border-emerald-500 rounded text-xs text-white"
                      />
                      <button
                        onClick={() => saveEditing(pl.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-emerald-400 truncate">
                        {pl.name}
                      </h4>
                      {pl.isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(pl);
                          }}
                          className="p-1 rounded text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-zinc-400">{pl.tracks.length} tracks</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Recently Played */}
      {activeTab === 'recent' && (
        <div className="space-y-4">
          {recentlyPlayed.length === 0 ? (
            <EmptyState
              icon={History}
              title="No playback history yet"
              description="Tracks you play in VIBEESH will show up here automatically."
              actionLabel="Start Listening"
              onAction={() => navigate('/')}
            />
          ) : (
            <div className="bg-[#12141c]/60 rounded-2xl border border-white/5 overflow-hidden">
              <div className="divide-y divide-white/[0.03] p-1">
                {recentlyPlayed.map((track, idx) => (
                  <TrackRow
                    key={`${track.id}-${idx}`}
                    track={track}
                    index={idx}
                    queueContext={recentlyPlayed}
                    onOpenAddToPlaylist={onOpenAddToPlaylist}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Saved Languages */}
      {activeTab === 'languages' && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-400">
            Pin your favorite languages to keep quick shortcut chips on the top navigation bar.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {LANGUAGES.map((lang) => {
              const isPref = preferredLanguages.includes(lang.code);

              return (
                <div
                  key={lang.code}
                  onClick={() => togglePreferredLanguage(lang.code)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isPref
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#141620] hover:bg-[#181a26] border-white/5 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold">{lang.nativeName}</span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isPref ? 'bg-emerald-500 text-black' : 'border border-zinc-600'
                      }`}
                    >
                      {isPref && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                  <p className="text-xs font-semibold">{lang.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
