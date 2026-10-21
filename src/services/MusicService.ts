import type { Track, Podcast, PodcastEpisode, Artist, ProviderStatus } from '../types';
import { ITunesProvider } from './iTunesProvider';
import { ArchiveOrgProvider } from './ArchiveOrgProvider';
import { JamendoProvider } from './JamendoProvider';
import { MusicBrainzProvider } from './MusicBrainzProvider';
import { LANGUAGES } from '../data/languages';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class MusicService {
  private static cache = new Map<string, CacheEntry<any>>();
  private static CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

  private static getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private static setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Home Screen Discovery
  static async getHomeDiscovery(): Promise<{
    featured: Track | null;
    trending: Track[];
    archiveGems: Track[];
    jamendoIndie: Track[];
    podcasts: Podcast[];
    quickLanguages: { code: string; name: string; nativeName: string; accentColor: string; topTrack?: Track }[];
  }> {
    const cacheKey = 'home_discovery_feed';
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    const [trending, archiveGems, jamendoIndie, podcasts] = await Promise.all([
      ITunesProvider.getTrendingTracks('top hits 2026', 12),
      ArchiveOrgProvider.getFeaturedArchiveTracks(),
      JamendoProvider.getFeaturedTracks(8),
      ITunesProvider.searchPodcasts('technology music story', 6),
    ]);

    const featured = trending[0] || archiveGems[0] || null;

    const quickLanguages = LANGUAGES.slice(0, 8).map((l) => ({
      code: l.code,
      name: l.name,
      nativeName: l.nativeName,
      accentColor: l.accentColor,
    }));

    const result = {
      featured,
      trending,
      archiveGems,
      jamendoIndie,
      podcasts,
      quickLanguages,
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // Multilingual tracks
  static async getTracksByLanguage(languageCode: string, limit = 20): Promise<Track[]> {
    const lang = LANGUAGES.find((l) => l.code === languageCode);
    const query = lang ? lang.popularQuery : `${languageCode} songs`;
    const cacheKey = `lang_${languageCode}_${limit}`;

    const cached = this.getFromCache<Track[]>(cacheKey);
    if (cached) return cached;

    const tracks = await ITunesProvider.searchTracks(query, limit, lang?.name);
    this.setCache(cacheKey, tracks);
    return tracks;
  }

  // Trending Tracks
  static async getTrendingTracks(genre = 'pop', limit = 24): Promise<Track[]> {
    const cacheKey = `trending_${genre}_${limit}`;
    const cached = this.getFromCache<Track[]>(cacheKey);
    if (cached) return cached;

    const tracks = await ITunesProvider.searchTracks(`${genre} hits chart`, limit);
    this.setCache(cacheKey, tracks);
    return tracks;
  }

  // Real New Releases
  static async getNewReleases(limit = 24): Promise<Track[]> {
    const cacheKey = `new_releases_${limit}`;
    const cached = this.getFromCache<Track[]>(cacheKey);
    if (cached) return cached;

    const [recentSingles, jamendoNew] = await Promise.all([
      ITunesProvider.searchTracks('new release 2025 2026 single', limit),
      JamendoProvider.getFeaturedTracks(limit / 2),
    ]);

    const combined = [...recentSingles, ...jamendoNew];
    this.setCache(cacheKey, combined);
    return combined;
  }

  // Podcasts and Categories
  static async getPodcastsByCategory(category: string, limit = 12): Promise<Podcast[]> {
    const cacheKey = `podcasts_${category}_${limit}`;
    const cached = this.getFromCache<Podcast[]>(cacheKey);
    if (cached) return cached;

    const podcasts = await ITunesProvider.searchPodcasts(category, limit);
    this.setCache(cacheKey, podcasts);
    return podcasts;
  }

  static async getPodcastEpisodes(podcastTitle: string, limit = 10): Promise<PodcastEpisode[]> {
    const cacheKey = `podcast_episodes_${podcastTitle}_${limit}`;
    const cached = this.getFromCache<PodcastEpisode[]>(cacheKey);
    if (cached) return cached;

    const episodes = await ITunesProvider.getPodcastEpisodes(podcastTitle, limit);
    this.setCache(cacheKey, episodes);
    return episodes;
  }

  // Unified Search
  static async searchAll(
    query: string,
    filter: 'all' | 'tracks' | 'artists' | 'podcasts' | 'cc' = 'all'
  ): Promise<{
    tracks: Track[];
    podcasts: Podcast[];
    archiveTracks: Track[];
    mbRecordings: Track[];
  }> {
    if (!query.trim()) {
      return { tracks: [], podcasts: [], archiveTracks: [], mbRecordings: [] };
    }

    const cacheKey = `search_${query}_${filter}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    let tracks: Track[] = [];
    let podcasts: Podcast[] = [];
    let archiveTracks: Track[] = [];
    let mbRecordings: Track[] = [];

    if (filter === 'all' || filter === 'tracks') {
      const itunesPromise = ITunesProvider.searchTracks(query, 16);
      const jamendoPromise = JamendoProvider.searchTracks(query, 6);
      const [itunesRes, jamendoRes] = await Promise.all([itunesPromise, jamendoPromise]);
      tracks = [...itunesRes, ...jamendoRes];
    }

    if (filter === 'all' || filter === 'podcasts') {
      podcasts = await ITunesProvider.searchPodcasts(query, 8);
    }

    if (filter === 'all' || filter === 'cc') {
      archiveTracks = await ArchiveOrgProvider.searchArchiveMusic(query, 8);
    }

    if (filter === 'all' || filter === 'tracks') {
      mbRecordings = await MusicBrainzProvider.searchRecordings(query, 5);
    }

    const result = { tracks, podcasts, archiveTracks, mbRecordings };
    this.setCache(cacheKey, result);
    return result;
  }

  // Artist Detail
  static async getArtistDetail(artistName: string): Promise<Artist> {
    const cacheKey = `artist_${artistName}`;
    const cached = this.getFromCache<Artist>(cacheKey);
    if (cached) return cached;

    const [tracks, mbArtist] = await Promise.all([
      ITunesProvider.searchTracks(artistName, 15),
      MusicBrainzProvider.searchArtist(artistName),
    ]);

    const artistTrack = tracks[0];
    const image = artistTrack?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

    const artistData: Artist = {
      id: artistTrack?.artistId || `artist-${artistName.toLowerCase().replace(/\s+/g, '-')}`,
      name: artistName,
      genre: artistTrack?.genre || mbArtist?.genre || 'Popular Artist',
      image,
      bio: mbArtist?.bio || `${artistName} is an accomplished artist featured across global charts with popular tracks and albums on VIBEESH.`,
      topTracks: tracks,
    };

    this.setCache(cacheKey, artistData);
    return artistData;
  }

  // Find Playable Alternative for metadata-only tracks
  static async findPlayableAlternative(track: Track): Promise<Track | null> {
    const query = `${track.title} ${track.artist}`;
    const results = await ITunesProvider.searchTracks(query, 3);
    const playable = results.find((t) => t.isPlayable && t.audioUrl);
    return playable || null;
  }

  // Status of Connected Providers
  static getProviderStatuses(): ProviderStatus[] {
    const jamendoKey = JamendoProvider.getClientId();
    return [
      {
        id: 'itunes',
        name: 'Apple Music / iTunes API',
        description: 'Instant preview audio streams, high-res covers, multilingual songs, and real podcast feeds.',
        status: 'active',
        isAudioPlayable: true,
        requiresKey: false,
        hasKey: true,
        badgeText: 'Active • Real Previews & Podcasts',
      },
      {
        id: 'archive',
        name: 'Internet Archive API',
        description: 'Millions of authorized Creative Commons, live music, 78rpm historical recordings, and public domain audio.',
        status: 'active',
        isAudioPlayable: true,
        requiresKey: false,
        hasKey: true,
        badgeText: 'Active • Full Length (CC / Public Domain)',
      },
      {
        id: 'jamendo',
        name: 'Jamendo Music API',
        description: 'Independent music licensed under Creative Commons with full-length streaming.',
        status: jamendoKey ? 'active' : 'configured',
        isAudioPlayable: true,
        requiresKey: true,
        hasKey: Boolean(jamendoKey),
        badgeText: jamendoKey ? 'Active • Full Length (Indie CC)' : 'Needs Client ID',
      },
      {
        id: 'musicbrainz',
        name: 'MusicBrainz & Cover Art Archive',
        description: 'Open encyclopedia of music recordings, artist discographies, release dates, and high-res cover art.',
        status: 'active',
        isAudioPlayable: false,
        requiresKey: false,
        hasKey: true,
        badgeText: 'Active • Catalog Metadata Only',
      },
    ];
  }
}
