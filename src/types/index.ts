export type TrackSourceType = 'preview' | 'full' | 'archive' | 'podcast' | 'metadata_only';

export type ProviderType = 'itunes' | 'archive' | 'jamendo' | 'musicbrainz' | 'podcast' | 'lrclib';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album: string;
  albumId?: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl?: string; // playable audio stream
  isPlayable: boolean;
  sourceType: TrackSourceType;
  provider: ProviderType;
  releaseDate?: string;
  language?: string;
  genre?: string;
  description?: string;
  originalUrl?: string;
  fullDuration?: number;
  licenseUrl?: string;
}

export interface Artist {
  id: string;
  name: string;
  genre?: string;
  image: string;
  bio?: string;
  topTracks: Track[];
  albums?: Album[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  coverUrl: string;
  releaseDate: string;
  trackCount: number;
  tracks: Track[];
  genre?: string;
  provider: ProviderType;
}

export interface PodcastEpisode {
  id: string;
  podcastId: string;
  podcastTitle: string;
  title: string;
  description: string;
  pubDate: string;
  duration: number;
  audioUrl: string;
  coverUrl: string;
}

export interface Podcast {
  id: string;
  title: string;
  publisher: string;
  coverUrl: string;
  description: string;
  category: string;
  episodes: PodcastEpisode[];
  provider: ProviderType;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  tracks: Track[];
  createdAt: string;
  isCustom?: boolean;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  popularQuery: string;
  accentColor: string;
  description: string;
  icon?: string;
}

export interface ProviderStatus {
  id: ProviderType;
  name: string;
  description: string;
  status: 'active' | 'configured' | 'limited' | 'error';
  isAudioPlayable: boolean;
  requiresKey: boolean;
  hasKey: boolean;
  badgeText: string;
}
