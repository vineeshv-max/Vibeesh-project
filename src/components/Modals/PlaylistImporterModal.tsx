import React, { useState } from 'react';
import {
  X,
  Download,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { MusicService } from '../../services/MusicService';
import type { Track } from '../../types';

interface PlaylistImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (playlistId: string) => void;
}

type PlatformType = 'spotify' | 'apple' | 'jiosaavn' | 'ytmusic' | 'text';

export const PlaylistImporterModal: React.FC<PlaylistImporterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createPlaylist, addTrackToPlaylist } = useLibrary();

  const [platform, setPlatform] = useState<PlatformType>('spotify');
  const [playlistName, setPlaylistName] = useState('Imported Playlist');
  const [inputText, setInputText] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedTracks, setResolvedTracks] = useState<Track[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleTracks = [
    'The Weeknd - Blinding Lights',
    'Dua Lipa - Levitating',
    'Coldplay - Yellow',
    'Ed Sheeran - Shape of You',
    'Harry Styles - As It Was',
  ].join('\n');

  const handleImport = async () => {
    setError(null);
    if (!inputText.trim()) {
      setError('Please provide a playlist link or paste track titles.');
      return;
    }

    setIsResolving(true);
    setStatusMessage('Parsing playlist entries...');
    setResolvedTracks([]);

    try {
      // Parse track titles and artists
      const rawLines = inputText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('//'));

      const tracksToSearch: { title: string; artist: string }[] = [];

      for (const line of rawLines) {
        // Handle "Artist - Title" or "Title - Artist" or standard URLs
        if (line.includes('http://') || line.includes('https://')) {
          // If link contains track name tokens or playlist identifiers
          const urlObj = new URL(line);
          const pathname = urlObj.pathname;
          // extract name from url slug if available
          const segments = pathname.split('/').filter(Boolean);
          const lastSegment = segments[segments.length - 1] || 'playlist-track';
          const cleanName = decodeURIComponent(lastSegment).replace(/[-_]/g, ' ');
          tracksToSearch.push({ title: cleanName, artist: '' });
        } else if (line.includes(' - ')) {
          const parts = line.split(' - ');
          tracksToSearch.push({ title: parts[1].trim(), artist: parts[0].trim() });
        } else {
          tracksToSearch.push({ title: line, artist: '' });
        }
      }

      setStatusMessage(`Resolving ${tracksToSearch.length} tracks to authorized audio streams...`);

      const matchedTracks: Track[] = [];

      for (let i = 0; i < tracksToSearch.length; i++) {
        const item = tracksToSearch[i];
        const query = item.artist ? `${item.title} ${item.artist}` : item.title;
        setStatusMessage(`Resolving (${i + 1}/${tracksToSearch.length}): "${item.title}"...`);

        try {
          const searchRes = await MusicService.searchAll(query, 'tracks');
          const playable = searchRes.tracks.find((t) => t.isPlayable && t.audioUrl);
          if (playable) {
            matchedTracks.push(playable);
          } else if (searchRes.tracks[0]) {
            matchedTracks.push(searchRes.tracks[0]);
          }
        } catch (e) {
          console.warn('Track resolution error:', e);
        }
      }

      if (matchedTracks.length === 0) {
        throw new Error('Could not resolve any tracks to authorized audio sources.');
      }

      setResolvedTracks(matchedTracks);
      // Create new playlist and add resolved tracks
      const newPl = createPlaylist(
        playlistName.trim() || 'Imported Playlist',
        `Imported ${matchedTracks.length} tracks from ${platform}.`
      );
      for (const t of matchedTracks) {
        addTrackToPlaylist(newPl.id, t);
      }
      setStatusMessage(`Successfully imported ${matchedTracks.length} tracks to "${playlistName}"!`);
      if (onSuccess) {
        onSuccess(newPl.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to import playlist.');
    } finally {
      setIsResolving(false);
    }
  };

  const platforms: { id: PlatformType; name: string; badge: string; color: string }[] = [
    { id: 'spotify', name: 'Spotify', badge: 'Playlist / Tracks', color: 'text-emerald-400' },
    { id: 'jiosaavn', name: 'JioSaavn', badge: 'Catalog Resolver', color: 'text-cyan-400' },
    { id: 'apple', name: 'Apple Music', badge: 'Catalog Importer', color: 'text-rose-400' },
    { id: 'ytmusic', name: 'YouTube Music', badge: 'Playlists / Mixes', color: 'text-red-400' },
    { id: 'text', name: 'Text / Raw List', badge: 'Title & Artist', color: 'text-purple-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0f1118] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141622]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">BloomFactory Playlist Importer</h2>
              <p className="text-xs text-zinc-400">
                Import playlists from external platforms into authorized Vibeesh audio streams
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Platform selector */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Select Source Platform:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  type="button"
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    platform === p.id
                      ? 'bg-white/10 border-emerald-500/50 shadow-md'
                      : 'bg-[#141620] border-white/5 hover:border-white/15'
                  }`}
                >
                  <p className={`text-xs font-bold ${p.color}`}>{p.name}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{p.badge}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Playlist Name */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              New Playlist Name:
            </label>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="e.g. My Favorite Hits"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141620] border border-white/10 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Input text / URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Paste Playlist URL or Track List:
              </label>
              <button
                type="button"
                onClick={() => setInputText(sampleTracks)}
                className="text-[11px] text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Load Sample List
              </button>
            </div>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste playlist URL or format like:&#10;Artist - Song Title&#10;The Weeknd - Blinding Lights&#10;Coldplay - Yellow"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141620] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 font-mono leading-relaxed"
            />
          </div>

          {/* Status / Error message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              {isResolving ? (
                <Loader2 className="w-4 h-4 shrink-0 text-emerald-400 animate-spin" />
              ) : (
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Resolved list preview if completed */}
          {resolvedTracks.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-zinc-300">
                Imported Tracks ({resolvedTracks.length}):
              </p>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {resolvedTracks.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-zinc-300"
                  >
                    <span className="truncate">
                      {idx + 1}. {t.title} &bull; <span className="text-zinc-500">{t.artist}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 shrink-0">
                      {t.sourceType === 'full' ? 'Full CC' : 'Preview'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#141622] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            {resolvedTracks.length > 0 ? 'Close' : 'Cancel'}
          </button>

          <button
            onClick={handleImport}
            disabled={isResolving}
            type="button"
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            {isResolving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Import to Library</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
