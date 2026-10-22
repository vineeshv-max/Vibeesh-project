import type { Track, Podcast, PodcastEpisode, Artist, ProviderStatus } from '../types';
import { ITunesProvider } from './iTunesProvider';
import { ArchiveOrgProvider } from './ArchiveOrgProvider';
import { JamendoProvider } from './JamendoProvider';
import { MusicBrainzProvider } from './MusicBrainzProvider';
import { LrcLibProvider, type LyricsResponse } from './LrcLibProvider';
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
      JamendoProvider.getFeaturedTracks(12),
      ITunesProvider.searchPodcasts('technology music story', 6),
    ]);

    // Prioritize full-length audio tracks for the spotlight feature so playback doesn't stop after 30s
    const featured = jamendoIndie[0] || archiveGems[0] || trending[0] || null;

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

    const [itunesTracks, jamendoTracks] = await Promise.all([
      ITunesProvider.searchTracks(query, limit, lang?.name),
      JamendoProvider.searchTracks(lang?.name || query, 6),
    ]);

    // Combine full-length tracks with regional preview tracks
    const tracks = [...jamendoTracks, ...itunesTracks];
    this.setCache(cacheKey, tracks);
    return tracks;
  }

  // Trending Tracks (combines full-length indie hits with popular chart previews)
  static async getTrendingTracks(genre = 'pop', limit = 24): Promise<Track[]> {
    const cacheKey = `trending_${genre}_${limit}`;
    const cached = this.getFromCache<Track[]>(cacheKey);
    if (cached) return cached;

    const halfLimit = Math.ceil(limit / 2);
    const [jamendoTracks, itunesTracks] = await Promise.all([
      JamendoProvider.getTracksByGenre(genre, halfLimit),
      ITunesProvider.searchTracks(`${genre} hits chart`, halfLimit),
    ]);

    const combined = [...jamendoTracks, ...itunesTracks];
    this.setCache(cacheKey, combined);
    return combined;
  }

  // Real New Releases
  static async getNewReleases(limit = 24): Promise<Track[]> {
    const cacheKey = `new_releases_${limit}`;
    const cached = this.getFromCache<Track[]>(cacheKey);
    if (cached) return cached;

    const halfLimit = Math.ceil(limit / 2);
    const [jamendoNew, recentSingles] = await Promise.all([
      JamendoProvider.getNewReleases(halfLimit),
      ITunesProvider.searchTracks('new release 2025 2026 single', halfLimit),
    ]);

    const combined = [...jamendoNew, ...recentSingles];
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
      const jamendoPromise = JamendoProvider.searchTracks(query, 12);
      const itunesPromise = ITunesProvider.searchTracks(query, 12);
      const [jamendoRes, itunesRes] = await Promise.all([jamendoPromise, itunesPromise]);
      // Place full-length authorized Jamendo streams first, followed by previews
      tracks = [...jamendoRes, ...itunesRes];
    }

    if (filter === 'all' || filter === 'podcasts') {
      podcasts = await ITunesProvider.searchPodcasts(query, 8);
    }

    if (filter === 'all' || filter === 'cc') {
      const [archiveRes, jamendoCCRes] = await Promise.all([
        ArchiveOrgProvider.searchArchiveMusic(query, 8),
        JamendoProvider.searchTracks(query, 8),
      ]);
      archiveTracks = [...jamendoCCRes, ...archiveRes];
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

    const [jamendoTracks, itunesTracks, mbArtist] = await Promise.all([
      JamendoProvider.searchTracks(artistName, 10),
      ITunesProvider.searchTracks(artistName, 15),
      MusicBrainzProvider.searchArtist(artistName),
    ]);

    const combinedTracks = [...jamendoTracks, ...itunesTracks];
    const artistTrack = combinedTracks[0];
    const image =
      artistTrack?.coverUrl ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

    const artistData: Artist = {
      id: artistTrack?.artistId || `artist-${artistName.toLowerCase().replace(/\s+/g, '-')}`,
      name: artistName,
      genre: artistTrack?.genre || mbArtist?.genre || 'Popular Artist',
      image,
      bio:
        mbArtist?.bio ||
        `${artistName} is an accomplished artist featured across global charts with popular tracks and albums on VIBEESH.`,
      topTracks: combinedTracks,
    };

    this.setCache(cacheKey, artistData);
    return artistData;
  }

  // Find Playable Alternative for metadata-only tracks
  static async findPlayableAlternative(track: Track): Promise<Track | null> {
    const query = `${track.title} ${track.artist}`;
    // First try full-length track on Jamendo
    const jamendoResults = await JamendoProvider.searchTracks(query, 4);
    const jamendoPlayable = jamendoResults.find((t) => t.isPlayable && t.audioUrl);
    if (jamendoPlayable) return jamendoPlayable;

    // Fall back to preview track on iTunes
    const results = await ITunesProvider.searchTracks(query, 4);
    const playable = results.find((t) => t.isPlayable && t.audioUrl);
    return playable || null;
  }

  // Get Lyrics via LRCLIB
  static async getLyrics(trackName: string, artistName: string, albumName?: string, duration?: number): Promise<LyricsResponse | null> {
    return LrcLibProvider.getLyrics(trackName, artistName, albumName, duration);
  }

  // Get Search Suggestions
  static async getSearchSuggestions(query: string, limit = 6): Promise<string[]> {
    return ITunesProvider.getSearchSuggestions(query, limit);
  }

  // Status of Connected Providers
  static getProviderStatuses(): ProviderStatus[] {
    const jamendoKey = JamendoProvider.getClientId();
    return [
      {
        id: 'jamendo',
        name: 'Jamendo Music API',
        description: 'Independent music licensed under Creative Commons with legal full-length streaming.',
        status: 'active',
        isAudioPlayable: true,
        requiresKey: true,
        hasKey: Boolean(jamendoKey),
        badgeText: 'Active • Full Length (Indie CC)',
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
        id: 'itunes',
        name: 'Apple Music / iTunes API',
        description: 'Instant 30-second preview audio streams, high-res covers, multilingual songs, and real podcast feeds.',
        status: 'active',
        isAudioPlayable: true,
        requiresKey: false,
        hasKey: true,
        badgeText: 'Active • 30s Previews & Podcasts',
      },
      {
        id: 'lrclib',
        name: 'LRCLIB Public Lyrics API',
        description: 'Crowd-sourced open lyrics database providing plain and timestamp-synchronized (.lrc) lyrics.',
        status: 'active',
        isAudioPlayable: false,
        requiresKey: false,
        hasKey: true,
        badgeText: 'Active • Synced & Plain Lyrics',
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
