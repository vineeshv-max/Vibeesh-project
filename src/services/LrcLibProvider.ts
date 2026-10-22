export interface SyncedLyricLine {
  time: number; // in seconds
  text: string;
}

export interface LyricsResponse {
  id?: number;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: string;
  syncedLyrics?: string;
  parsedLines?: SyncedLyricLine[];
}

export class LrcLibProvider {
  private static BASE_URL = 'https://lrclib.net/api';
  private static cache = new Map<string, LyricsResponse | null>();

  /**
   * Parse standard [mm:ss.xx] timestamped lines from syncedLyrics into an array of { time, text }
   */
  public static parseLrc(syncedLrc: string): SyncedLyricLine[] {
    const lines = syncedLrc.split('\n');
    const parsed: SyncedLyricLine[] = [];

    const timeRegex = /^\[(\d{1,2}):(\d{1,2}(?:\.\d+)?)\]\s*(.*)$/;

    for (const rawLine of lines) {
      const match = rawLine.trim().match(timeRegex);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseFloat(match[2]);
        const text = match[3].trim();
        parsed.push({
          time: minutes * 60 + seconds,
          text,
        });
      }
    }

    return parsed.sort((a, b) => a.time - b.time);
  }

  /**
   * Fetch lyrics from LRCLIB using exact track, artist, album, and duration metadata
   */
  public static async getLyrics(
    trackName: string,
    artistName: string,
    albumName?: string,
    duration?: number
  ): Promise<LyricsResponse | null> {
    if (!trackName.trim() || !artistName.trim()) return null;

    const cacheKey = `${trackName.toLowerCase()}|${artistName.toLowerCase()}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || null;
    }

    try {
      // 1. Try exact match first
      const params = new URLSearchParams({
        track_name: trackName,
        artist_name: artistName,
      });
      if (albumName) params.append('album_name', albumName);
      if (duration && duration > 0) params.append('duration', Math.round(duration).toString());

      const res = await fetch(`${this.BASE_URL}/get?${params.toString()}`);
      if (res.ok) {
        const data: LyricsResponse = await res.json();
        if (data.syncedLyrics) {
          data.parsedLines = this.parseLrc(data.syncedLyrics);
        }
        this.cache.set(cacheKey, data);
        return data;
      }

      // 2. Fall back to search query if exact get fails
      const searchRes = await fetch(
        `${this.BASE_URL}/search?q=${encodeURIComponent(`${trackName} ${artistName}`)}`
      );
      if (searchRes.ok) {
        const searchList = await searchRes.json();
        if (Array.isArray(searchList) && searchList.length > 0) {
          const match: LyricsResponse = searchList[0];
          if (match.syncedLyrics) {
            match.parsedLines = this.parseLrc(match.syncedLyrics);
          }
          this.cache.set(cacheKey, match);
          return match;
        }
      }

      this.cache.set(cacheKey, null);
      return null;
    } catch (err) {
      console.warn('LRCLIB lyrics fetch failed:', err);
      return null;
    }
  }
}
