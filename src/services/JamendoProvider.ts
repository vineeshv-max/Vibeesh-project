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
  shorturl?: string;
  license_ccurl?: string;
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

function decodeHtmlEntities(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&egrave;/g, 'è')
    .replace(/&eacute;/g, 'é')
    .replace(/&agrave;/g, 'à')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&uuml;/g, 'ü')
    .replace(/&ouml;/g, 'ö');
}

export class JamendoProvider {
  private static BASE_URL = 'https://api.jamendo.com/v3.0';

  /**
   * Retrieves the configured client ID.
   * Checks Vite/Vercel environment variables first, then localStorage,
   * with fallback to the verified active client ID.
   */
  static getClientId(): string {
    const envKey = (import.meta as any).env?.VITE_JAMENDO_CLIENT_ID;
    const saved =
      localStorage.getItem('vibeesh_jamendo_client_id') ||
      localStorage.getItem('melodyverse_jamendo_client_id');
    return (envKey?.trim() || saved?.trim() || '3dce8b55').trim();
  }

  /**
   * Saves or clears the configured Jamendo client ID in localStorage.
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

  private static mapJamendoTrack(item: JamendoTrackItem): Track {
    const title = decodeHtmlEntities(item.name) || 'Independent Track';
    const artist = decodeHtmlEntities(item.artist_name) || 'Jamendo Indie Artist';
    const album = decodeHtmlEntities(item.album_name) || 'Independent Single';
    const audioUrl = item.audio || item.audiodownload;
    const duration = item.duration && item.duration > 0 ? item.duration : 180;
    const coverUrl =
      item.album_image ||
      item.image ||
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80';

    return {
      id: `jamendo-${item.id}`,
      title,
      artist,
      artistId: item.artist_id,
      album,
      albumId: item.album_id,
      duration,
      coverUrl,
      audioUrl,
      isPlayable: Boolean(audioUrl),
      sourceType: 'full',
      provider: 'jamendo',
      releaseDate: item.releasedate,
      description: item.license_ccurl
        ? `Full-length authorized track under Creative Commons (${item.license_ccurl}) via Jamendo API.`
        : 'Full-length authorized track under Creative Commons via Jamendo API.',
      originalUrl: item.shareurl || item.shorturl || `https://www.jamendo.com/track/${item.id}`,
      licenseUrl: item.license_ccurl,
      genre: item.musicinfo?.tags?.genres?.[0] || 'Indie / CC',
    };
  }

  /**
   * Fetches popular Creative Commons tracks from Jamendo API for full-length playback.
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
        include: 'musicinfo+licenses',
        audioformat: 'mp31', // Standard 128kbps stream with full seeking support
      });

      const res = await fetch(`${this.BASE_URL}/tracks/?${params.toString()}`);
      if (!res.ok) return [];

      const data: JamendoApiResponse = await res.json();
      if (data.headers.status !== 'success' || !data.results) {
        console.warn('Jamendo API response failed:', data.headers.error_message);
        return [];
      }

      return data.results.map((item) => this.mapJamendoTrack(item));
    } catch (err) {
      console.warn('Jamendo tracks fetch error:', err);
      return [];
    }
  }

  /**
   * Searches tracks on Jamendo using keywords, tags, or artist names for full-length playback.
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
        include: 'musicinfo+licenses',
        audioformat: 'mp31',
      });

      const res = await fetch(`${this.BASE_URL}/tracks/?${params.toString()}`);
      if (!res.ok) return [];

      const data: JamendoApiResponse = await res.json();
      if (data.headers.status !== 'success' || !data.results) return [];

      return data.results.map((item) => this.mapJamendoTrack(item));
    } catch (err) {
      console.warn('Jamendo search error:', err);
      return [];
    }
  }

  /**
   * Fetches full-length popular tracks by genre/tag on Jamendo.
   */
  static async getTracksByGenre(genre: string, limit = 12): Promise<Track[]> {
    const clientId = this.getClientId();
    if (!clientId) return [];

    try {
      const params = new URLSearchParams({
        client_id: clientId,
        format: 'json',
        limit: limit.toString(),
        order: 'popularity_total',
        tags: genre.trim().toLowerCase(),
        include: 'musicinfo+licenses',
        audioformat: 'mp31',
      });

      const res = await fetch(`${this.BASE_URL}/tracks/?${params.toString()}`);
      if (!res.ok) return [];

      const data: JamendoApiResponse = await res.json();
      if (data.headers.status === 'success' && data.results && data.results.length > 0) {
        return data.results.map((item) => this.mapJamendoTrack(item));
      }

      // If tags query returned nothing, try fuzzy search
      return this.searchTracks(genre, limit);
    } catch (err) {
      console.warn('Jamendo genre tracks error:', err);
      return [];
    }
  }

  /**
   * Fetches the latest new releases on Jamendo with full-length streaming.
   */
  static async getNewReleases(limit = 12): Promise<Track[]> {
    const clientId = this.getClientId();
    if (!clientId) return [];

    try {
      const params = new URLSearchParams({
        client_id: clientId,
        format: 'json',
        limit: limit.toString(),
        order: 'releasedate_desc',
        include: 'musicinfo+licenses',
        audioformat: 'mp31',
      });

      const res = await fetch(`${this.BASE_URL}/tracks/?${params.toString()}`);
      if (!res.ok) return [];

      const data: JamendoApiResponse = await res.json();
      if (data.headers.status !== 'success' || !data.results) return [];

      return data.results.map((item) => this.mapJamendoTrack(item));
    } catch (err) {
      console.warn('Jamendo new releases error:', err);
      return [];
    }
  }
}
