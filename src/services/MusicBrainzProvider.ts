import { MusicBrainzApi } from 'musicbrainz-api';
import type { Track, Artist } from '../types';

export class MusicBrainzProvider {
  private static mbApi = new MusicBrainzApi({
    appName: 'VIBEESH',
    appVersion: '1.0.0',
    appContactInfo: 'https://github.com/vibeesh/web-player',
  });

  static async searchRecordings(query: string, limit = 8): Promise<Track[]> {
    try {
      const result = await this.mbApi.search('recording', {
        query,
        limit,
      });

      const recordings = (result as any)?.recordings || [];

      return recordings.map((rec: any) => {
        const artistCredit = rec['artist-credit']?.[0]?.name || 'Unknown Artist';
        const release = rec.releases?.[0];
        const albumTitle = release?.title || 'Single / Compilation';
        const releaseGroupMbid = release?.['release-group']?.id;
        const durationSec = rec.length ? Math.round(rec.length / 1000) : 210;

        const coverUrl = releaseGroupMbid
          ? `https://coverartarchive.org/release-group/${releaseGroupMbid}/front-500`
          : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80';

        return {
          id: `mb-${rec.id}`,
          title: rec.title,
          artist: artistCredit,
          album: albumTitle,
          duration: durationSec,
          coverUrl,
          audioUrl: undefined,
          isPlayable: false, // MusicBrainz is catalog metadata only
          sourceType: 'metadata_only',
          provider: 'musicbrainz',
          releaseDate: release?.date,
          description: 'Verified catalog metadata from MusicBrainz official API client. Audio preview requires streaming provider search.',
          originalUrl: `https://musicbrainz.org/recording/${rec.id}`,
        };
      });
    } catch (err) {
      console.warn('MusicBrainz API error via client:', err);
      return [];
    }
  }

  static async searchArtist(artistName: string): Promise<Artist | null> {
    try {
      const result = await this.mbApi.search('artist', {
        query: artistName,
        limit: 1,
      });

      const artist = (result as any)?.artists?.[0];
      if (!artist) return null;

      return {
        id: `mb-artist-${artist.id}`,
        name: artist.name,
        genre: artist.disambiguation || artist.type || 'Musical Artist',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        bio: `${artist.name} is a ${artist.type || 'recording artist'} from ${artist['country'] || 'worldwide'}, established in ${artist['life-span']?.begin || 'early years'}. Verified on MusicBrainz.`,
        topTracks: [],
      };
    } catch (err) {
      console.warn('MusicBrainz artist query error via client:', err);
      return null;
    }
  }
}
