import type { Track } from '../types';

export interface JamendoTrackItem {
  id: string;
  name: string;
  duration: number;
  artist_id: string;
  artist_name: string;
  album_name: string;
  album_id: string;
  album_image: string;
  image: string;
  audio: string;
  audiodownload: string;
  releasedate: string;
  shareurl: string;
  musicinfo?: {
    vocalinstrumental?: string;
    lang?: string;
    gender?: string;
    acousticelectric?: string;
    speed?: string;
    tags?: {
      genres?: string[];
      instruments?: string[];
      vartags?: string[];
    };
  };
}

export interface JamendoApiResponse {
  headers: {
    status: 'success' | 'failed';
    code: number;
    error_message: string;
    warnings: string;
    results_count: number;
  };
  results: JamendoTrackItem[];
}

export class JamendoProvider {
  private static BASE_URL = 'https://api.jamendo.com/v3.0';

  /**
   * Retrieves the configured client ID from localStorage, or returns null if not set.
   */
  static getClientId(): string {
    const saved = localStorage.getItem('vibeesh_jamendo_client_id') || localStorage.getItem('melodyverse_jamendo_client_id');
    return saved?.trim() || '';
  }

  /**
   * Saves or clears the configured Jamendo client ID.
   */
  static setClientId(key: string): void {
    if (key.trim()) {
      localStorage.setItem('vibeesh_jamendo_client_id', key.trim());
    } else {
      localStorage.removeItem('vibeesh_jamendo_client_id');
      localStorage.removeItem('melodyverse_jamendo_client_id');
    }
  }

  /**
   * Validates a client ID by querying Jamendo's official API.
   */
  static async testCredentials(clientId: string): Promise<{
    isValid: boolean;
    message: string;
  }> {
    if (!clientId.trim()) {
      return {
        isValid: false,
        message: 'Client ID is empty. Please enter your Jamendo Developer Client ID.',
      };
    }

    try {
      const url = `${this.BASE_URL}/tracks/?client_id=${encodeURIComponent(
        clientId.trim()
      )}&format=json&limit=1`;
      const res = await fetch(url);
      if (!res.ok) {
        return {
          isValid: false,
          message: `Jamendo server returned HTTP ${res.status} (${res.statusText})`,
        };
      }

      const data: JamendoApiResponse = await res.json();
      if (data.headers.status === 'success') {
        return {
          isValid: true,
          message: 'Client ID is valid and authorized for streaming!',
        };
      } else {
        return {
          isValid: false,
          message: data.headers.error_message || 'Jamendo rejected this Client ID.',
        };
      }
    } catch (err: any) {
      return {
        isValid: false,
        message: `Network error reaching Jamendo API: ${err?.message || err}`,
      };
    }
  }

  /**
   * Fetches popular Creative Commons tracks from Jamendo API.
   */
  static async getFeaturedTracks(limit = 12): Promise<Track[]> {
    const clientId = this.getClientId();
    if (!clientId) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        client_id: clientId,
        format: 'json',
        limit: limit.toString(),
        order: 'popularity_total',
        include: 'musicinfo',
        audioformat: 'mp32', // High quality 320kbps MP3 stream
      });

      const res = await fetch(`${this.BASE_URL}/tracks/?${params.toString()}`);
      if (!res.ok) return [];

      const data: JamendoApiResponse = await res.json();
      if (data.headers.status !== 'success') {
        console.warn('Jamendo API response failed:', data.headers.error_message);
        return [];
      }

      return data.results.map((item) => ({
        id: `jamendo-${item.id}`,
        title: item.name,
        artist: item.artist_name,
        artistId: item.artist_id,
        album: item.album_name || 'Independent Single',
        albumId: item.album_id,
        duration: item.duration || 180,
        coverUrl:
          item.album_image ||
          item.image ||
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        audioUrl: item.audio,
        isPlayable: Boolean(item.audio),
        sourceType: 'full',
        provider: 'jamendo',
        releaseDate: item.releasedate,
        description: 'Full-length authorized track under Creative Commons via Jamendo API.',
        originalUrl: item.shareurl,
        genre: item.musicinfo?.tags?.genres?.[0] || 'Indie / CC',
      }));
    } catch (err) {
      console.warn('Jamendo tracks fetch error:', err);
      return [];
    }
  }

  /**
   * Searches tracks on Jamendo using keywords, tags, or artist names.
   */
  static async searchTracks(query: string, limit = 12): Promise<Track[]> {
    const clientId = this.getClientId();
    if (!clientId || !query.trim()) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        client_id: clientId,
        format: 'json',
        limit: limit.toString(),
        search: query.trim(),
        order: 'relevance',
        audioformat: 'mp32',
      });

      const res = await fetch(`${this.BASE_URL}/tracks/?${params.toString()}`);
      if (!res.ok) return [];

      const data: JamendoApiResponse = await res.json();
      if (data.headers.status !== 'success') return [];

      return data.results.map((item) => ({
        id: `jamendo-${item.id}`,
        title: item.name,
        artist: item.artist_name,
        artistId: item.artist_id,
        album: item.album_name || 'Jamendo Indie',
        albumId: item.album_id,
        duration: item.duration || 180,
        coverUrl:
          item.album_image ||
          item.image ||
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        audioUrl: item.audio,
        isPlayable: Boolean(item.audio),
        sourceType: 'full',
        provider: 'jamendo',
        releaseDate: item.releasedate,
        description: 'Independent track streamable via Jamendo API.',
        originalUrl: item.shareurl,
      }));
    } catch (err) {
      console.warn('Jamendo search error:', err);
      return [];
    }
  }
}
