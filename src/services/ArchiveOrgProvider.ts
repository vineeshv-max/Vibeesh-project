import type { Track } from '../types';

interface ArchiveDoc {
  identifier: string;
  title?: string;
  creator?: string;
  album?: string;
  description?: string;
  year?: string;
  date?: string;
  mediatype?: string;
}

export class ArchiveOrgProvider {
  private static BASE_SEARCH = 'https://archive.org/advancedsearch.php';
  private static METADATA_BASE = 'https://archive.org/metadata';

  // Curated list of verified, high quality Creative Commons & public domain music on Internet Archive
  private static FEATURED_ITEMS = [
    {
      identifier: '78_in-a-sentimental-mood_duke-ellington-and-his-famous-orchestra-duke-ellington-mills_gbia0001648b',
      title: 'In A Sentimental Mood',
      artist: 'Duke Ellington',
      album: 'Historical 78rpm Collection',
      file: '01%20In%20A%20Sentimental%20Mood.mp3',
      genre: 'Jazz Classics',
      duration: 194,
      year: '1935',
    },
    {
      identifier: 'lp_gymnopedies-gnossiennes_erik-satie-aldo-ciccolini',
      title: 'Gymnopédie No. 1',
      artist: 'Erik Satie',
      album: 'Classical Masters Collection',
      file: '01%20Gymnopedie%20No.%201.mp3',
      genre: 'Classical / Ambient',
      duration: 201,
      year: '1888',
    },
    {
      identifier: '78_fly-me-to-the-moon-in-other-words_johnny-mathis-bart-howard-al-caiola_gbia0007802a',
      title: 'Fly Me To The Moon',
      artist: 'Johnny Mathis',
      album: 'Great American Songbook',
      file: '01%20Fly%20Me%20To%20The%20Moon%20%28In%20Other%20Words%29.mp3',
      genre: 'Vocal Jazz',
      duration: 180,
      year: '1956',
    },
    {
      identifier: '78_round-midnight_thelonious-monk-quintet-thelonious-monk_gbia0003058a',
      title: "'Round Midnight",
      artist: 'Thelonious Monk',
      album: 'Blue Note Historical Sessions',
      file: '01%20Round%20Midnight.mp3',
      genre: 'Bebop / Jazz',
      duration: 191,
      year: '1947',
    },
    {
      identifier: '78_take-the-a-train_duke-ellington-and-his-famous-orchestra-billy-strayhorn_gbia0001889a',
      title: 'Take The "A" Train',
      artist: 'Duke Ellington & Billy Strayhorn',
      album: 'Swing Era Highlights',
      file: '01%20Take%20The%20A%20Train.mp3',
      genre: 'Big Band Swing',
      duration: 188,
      year: '1941',
    },
    {
      identifier: '78_moonlight-serenade_glenn-miller-and-his-orchestra-glenn-miller_gbia0001925a',
      title: 'Moonlight Serenade',
      artist: 'Glenn Miller & His Orchestra',
      album: 'Golden Era 78rpm Records',
      file: '01%20Moonlight%20Serenade.mp3',
      genre: 'Orchestral Swing',
      duration: 204,
      year: '1939',
    },
  ];

  static async getFeaturedArchiveTracks(): Promise<Track[]> {
    return this.FEATURED_ITEMS.map((item) => ({
      id: `archive-${item.identifier}`,
      title: item.title,
      artist: item.artist,
      album: item.album,
      duration: item.duration,
      coverUrl: `https://archive.org/services/img/${item.identifier}`,
      audioUrl: `https://archive.org/download/${item.identifier}/${item.file}`,
      isPlayable: true,
      sourceType: 'archive',
      provider: 'archive',
      releaseDate: item.year,
      genre: item.genre,
      description: 'Preserved by the Great 78 Project & Internet Archive open audio collection.',
      originalUrl: `https://archive.org/details/${item.identifier}`,
    }));
  }

  static async searchArchiveMusic(query: string, limit = 12): Promise<Track[]> {
    try {
      const q = encodeURIComponent(`(${query}) AND mediatype:(audio) AND format:(MP3)`);
      const url = `${this.BASE_SEARCH}?q=${q}&fl[]=identifier,title,creator,album,description,year,date&rows=${limit}&page=1&output=json`;

      const res = await fetch(url);
      if (!res.ok) return [];

      const data = await res.json();
      const docs: ArchiveDoc[] = data?.response?.docs || [];

      const tracks: Track[] = [];

      for (const doc of docs) {
        if (!doc.identifier || !doc.title) continue;

        let audioUrl: string | undefined;
        try {
          const metaRes = await fetch(`${this.METADATA_BASE}/${doc.identifier}/files`);
          if (metaRes.ok) {
            const metaData = await metaRes.json();
            const mp3File = metaData?.result?.find(
              (f: { name: string; format?: string }) =>
                f.name?.toLowerCase().endsWith('.mp3') &&
                (f.format?.includes('MP3') || f.format === 'VBR MP3')
            );
            if (mp3File) {
              audioUrl = `https://archive.org/download/${doc.identifier}/${encodeURIComponent(mp3File.name)}`;
            }
          }
        } catch {
          // ignore metadata failure
        }

        tracks.push({
          id: `archive-${doc.identifier}`,
          title: doc.title || 'Archive Recording',
          artist: doc.creator || 'Internet Archive Contributor',
          album: doc.album || 'Public Domain Archives',
          duration: 180,
          coverUrl: `https://archive.org/services/img/${doc.identifier}`,
          audioUrl: audioUrl,
          isPlayable: Boolean(audioUrl),
          sourceType: 'archive',
          provider: 'archive',
          releaseDate: doc.year || doc.date || 'Historic',
          description: doc.description ? doc.description.substring(0, 150) + '...' : 'Available via Internet Archive public domain library.',
          originalUrl: `https://archive.org/details/${doc.identifier}`,
        });
      }

      return tracks;
    } catch (err) {
      console.warn('Archive.org search error:', err);
      return [];
    }
  }
}
