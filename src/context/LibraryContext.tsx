import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Track, Playlist } from '../types';
import { usePlayer } from './PlayerContext';

interface LibraryContextType {
  likedTracks: Track[];
  playlists: Playlist[];
  recentlyPlayed: Track[];
  preferredLanguages: string[];
  isLiked: (trackId: string) => boolean;
  toggleLike: (track: Track) => void;
  createPlaylist: (name: string, description?: string) => Playlist;
  renamePlaylist: (id: string, newName: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  togglePreferredLanguage: (languageCode: string) => void;
  isPreferredLanguage: (languageCode: string) => boolean;
}

const STORAGE_KEY = 'vibeesh_library_data_v1';
const LEGACY_STORAGE_KEY = 'melodyverse_library_data_v1';

function getInitialLibraryData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load library data from storage', e);
  }
  return null;
}

const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-favorites',
    name: 'Top Picks & Favorites',
    description: 'Your favorite tracks, curated and ready to replay anytime.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    tracks: [],
    createdAt: new Date().toISOString(),
    isCustom: false,
  },
  {
    id: 'pl-chill',
    name: 'Late Night Chill',
    description: 'Atmospheric melodies and mellow grooves for focus and unwinding.',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    tracks: [],
    createdAt: new Date().toISOString(),
    isCustom: false,
  },
];

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTrack } = usePlayer();

  const [likedTracks, setLikedTracks] = useState<Track[]>(() => {
    const data = getInitialLibraryData();
    return data?.likedTracks || [];
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const data = getInitialLibraryData();
    if (data?.playlists && data.playlists.length > 0) {
      return data.playlists;
    }
    return DEFAULT_PLAYLISTS;
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(() => {
    const data = getInitialLibraryData();
    return data?.recentlyPlayed || [];
  });

  const [preferredLanguages, setPreferredLanguages] = useState<string[]>(() => {
    const data = getInitialLibraryData();
    return data?.preferredLanguages || ['en', 'ta', 'hi'];
  });

  // Automatically record recently played tracks when currentTrack changes
  useEffect(() => {
    if (!currentTrack) return;

    setRecentlyPlayed((prev) => {
      // Remove any existing instance of this track
      const filtered = prev.filter((t) => t.id !== currentTrack.id);
      // Place currentTrack at top, limit to 40 tracks
      return [currentTrack, ...filtered].slice(0, 40);
    });
  }, [currentTrack]);

  // Persist state to localStorage on changes
  useEffect(() => {
    try {
      const payload = {
        likedTracks,
        playlists,
        recentlyPlayed,
        preferredLanguages,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save library data to localStorage', e);
    }
  }, [likedTracks, playlists, recentlyPlayed, preferredLanguages]);

  const isLiked = useCallback(
    (trackId: string) => {
      return likedTracks.some((t) => t.id === trackId);
    },
    [likedTracks]
  );

  const toggleLike = useCallback((track: Track) => {
    setLikedTracks((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      if (exists) {
        return prev.filter((t) => t.id !== track.id);
      } else {
        return [track, ...prev];
      }
    });
  }, []);

  const createPlaylist = useCallback((name: string, description = ''): Playlist => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name: name.trim() || 'My Playlist',
      description: description.trim() || 'Custom curated playlist on VIBEESH.',
      tracks: [],
      createdAt: new Date().toISOString(),
      isCustom: true,
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    };

    setPlaylists((prev) => [newPlaylist, ...prev]);
    return newPlaylist;
  }, []);

  const renamePlaylist = useCallback((id: string, newName: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => (pl.id === id ? { ...pl, name: newName.trim() || pl.name } : pl))
    );
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => prev.filter((pl) => pl.id !== id));
  }, []);

  const addTrackToPlaylist = useCallback((playlistId: string, track: Track) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.tracks.some((t) => t.id === track.id)) return pl; // already in playlist
        const updatedTracks = [...pl.tracks, track];
        return {
          ...pl,
          tracks: updatedTracks,
          coverUrl: pl.coverUrl || track.coverUrl,
        };
      })
    );
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return {
          ...pl,
          tracks: pl.tracks.filter((t) => t.id !== trackId),
        };
      })
    );
  }, []);

  const togglePreferredLanguage = useCallback((languageCode: string) => {
    setPreferredLanguages((prev) => {
      if (prev.includes(languageCode)) {
        return prev.filter((c) => c !== languageCode);
      } else {
        return [...prev, languageCode];
      }
    });
  }, []);

  const isPreferredLanguage = useCallback(
    (languageCode: string) => {
      return preferredLanguages.includes(languageCode);
    },
    [preferredLanguages]
  );

  return (
    <LibraryContext.Provider
      value={{
        likedTracks,
        playlists,
        recentlyPlayed,
        preferredLanguages,
        isLiked,
        toggleLike,
        createPlaylist,
        renamePlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        togglePreferredLanguage,
        isPreferredLanguage,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
