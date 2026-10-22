import type { Track, Podcast, PodcastEpisode } from '../types';

interface ITunesTrackResult {
  trackId: number;
  trackName: string;
  artistName: string;
  artistId?: number;
  collectionName?: string;
  collectionId?: number;
  artworkUrl100?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
  releaseDate?: string;
  primaryGenreName?: string;
  trackViewUrl?: string;
}

interface ITunesPodcastResult {
  collectionId: number;
  trackId?: number;
  collectionName?: string;
  trackName?: string;
  artistName: string;
  artworkUrl600?: string;
  artworkUrl100?: string;
  feedUrl?: string;
  episodeUrl?: string;
  description?: string;
  shortDescription?: string;
  primaryGenreName?: string;
  releaseDate?: string;
  trackTimeMillis?: number;
}

// Enhance image resolution from iTunes default 100x100 to 600x600
function getHighResArtwork(url?: string): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
  }
  return url.replace('100x100bb', '600x600bb').replace('60x60bb', '600x600bb');
}

export class ITunesProvider {
  private static BASE_URL = 'https://itunes.apple.com/search';

  static async searchTracks(query: string, limit = 25, language?: string): Promise<Track[]> {
    try {
      const searchTerm = language ? `${query} ${language}` : query;
      const params = new URLSearchParams({
        term: searchTerm,
        media: 'music',
        entity: 'song',
        limit: limit.toString(),
      });

      const res = await fetch(`${this.BASE_URL}?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`iTunes search failed: ${res.statusText}`);
      }

      const data = await res.json();
      const results: ITunesTrackResult[] = data.results || [];

      return results
        .filter((item) => item.trackName && item.artistName)
        .map((item) => {
          const originalDuration = item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : undefined;
          const officialUrl =
            item.trackViewUrl ||
            `https://music.apple.com/search?term=${encodeURIComponent(`${item.trackName} ${item.artistName}`)}`;

          return {
            id: `itunes-${item.trackId}`,
            title: item.trackName,
            artist: item.artistName,
            artistId: item.artistId?.toString(),
            album: item.collectionName || 'Single',
            albumId: item.collectionId?.toString(),
            // Actual playable stream duration for commercial iTunes tracks is 30 seconds
            duration: 30,
            fullDuration: originalDuration,
            coverUrl: getHighResArtwork(item.artworkUrl100),
            audioUrl: item.previewUrl,
            isPlayable: Boolean(item.previewUrl),
            sourceType: 'preview' as const,
            provider: 'itunes' as const,
            releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : undefined,
            genre: item.primaryGenreName,
            originalUrl: officialUrl,
            description: 'Official 30-second preview clip. Full song available on Apple Music.',
            language,
          };
        });
    } catch (err) {
      console.warn('iTunes search error:', err);
      return [];
    }
  }

  static async getTrendingTracks(genre = 'pop', limit = 20): Promise<Track[]> {
    return this.searchTracks(genre, limit);
  }

  static async searchPodcasts(query: string, limit = 12): Promise<Podcast[]> {
    try {
      const params = new URLSearchParams({
        term: query,
        media: 'podcast',
        entity: 'podcast',
        limit: limit.toString(),
      });

      const res = await fetch(`${this.BASE_URL}?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Podcast search failed: ${res.statusText}`);
      }

      const data = await res.json();
      const results: ITunesPodcastResult[] = data.results || [];

      return results.map((item) => ({
        id: `itunes-pod-${item.collectionId}`,
        title: item.collectionName || item.trackName || 'Podcast Show',
        publisher: item.artistName || 'Creator',
        coverUrl: getHighResArtwork(item.artworkUrl600 || item.artworkUrl100),
        description: item.description || item.shortDescription || 'Audio discussions, deep dives, and expert commentary.',
        category: item.primaryGenreName || 'General',
        episodes: [],
        provider: 'itunes' as const,
      }));
    } catch (err) {
      console.warn('iTunes podcast search error:', err);
      return [];
    }
  }

  static async getPodcastEpisodes(podcastTitle: string, limit = 10): Promise<PodcastEpisode[]> {
    try {
      const params = new URLSearchParams({
        term: podcastTitle,
        media: 'podcast',
        entity: 'podcastEpisode',
        limit: limit.toString(),
      });

      const res = await fetch(`${this.BASE_URL}?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Podcast episodes search failed: ${res.statusText}`);
      }

      const data = await res.json();
      const results: ITunesPodcastResult[] = data.results || [];

      return results
        .filter((item) => item.episodeUrl)
        .map((item, index) => ({
          id: `itunes-ep-${item.trackId || index}-${item.collectionId}`,
          podcastId: `itunes-pod-${item.collectionId}`,
          podcastTitle: item.collectionName || podcastTitle,
          title: item.trackName || `Episode ${index + 1}`,
          description: item.description || item.shortDescription || 'Full podcast episode recording.',
          pubDate: item.releaseDate ? item.releaseDate.split('T')[0] : 'Recent',
          duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 1800,
          audioUrl: item.episodeUrl || '',
          coverUrl: getHighResArtwork(item.artworkUrl600 || item.artworkUrl100),
        }));
    } catch (err) {
      console.warn('iTunes podcast episodes error:', err);
      return [];
    }
  }

  static async getAlbumTracks(albumId: string): Promise<Track[]> {
    try {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${albumId}&entity=song`);
      if (!res.ok) return [];
      const data = await res.json();
      const items: ITunesTrackResult[] = (data.results || []).slice(1);

      return items.map((item) => {
        const originalDuration = item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : undefined;
        const officialUrl =
          item.trackViewUrl ||
          `https://music.apple.com/search?term=${encodeURIComponent(`${item.trackName} ${item.artistName}`)}`;

        return {
          id: `itunes-${item.trackId}`,
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName || 'Album',
          duration: 30,
          fullDuration: originalDuration,
          coverUrl: getHighResArtwork(item.artworkUrl100),
          audioUrl: item.previewUrl,
          isPlayable: Boolean(item.previewUrl),
          sourceType: 'preview' as const,
          provider: 'itunes' as const,
          genre: item.primaryGenreName,
          originalUrl: officialUrl,
          description: 'Official 30-second preview clip. Full song available on Apple Music.',
        };
      });
    } catch (err) {
      console.warn('iTunes album tracks error:', err);
      return [];
    }
  }

  static async getSearchSuggestions(query: string, limit = 6): Promise<string[]> {
    if (!query.trim()) return [];
    try {
      const params = new URLSearchParams({
        term: query.trim(),
        media: 'music',
        entity: 'song',
        limit: limit.toString(),
      });
      const res = await fetch(`${this.BASE_URL}?${params.toString()}`);
      if (!res.ok) return [];
      const data = await res.json();
      const suggestions = new Set<string>();
      for (const item of data.results || []) {
        if (item.trackName) suggestions.add(item.trackName);
        if (item.artistName) suggestions.add(item.artistName);
      }
      return Array.from(suggestions).slice(0, limit);
    } catch {
      return [];
    }
  }
}
