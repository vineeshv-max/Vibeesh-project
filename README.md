# 🎵 VIBEESH — Feel every Beat
### Modern Music & Podcast Streaming Web Application

**VIBEESH** (*"Feel every Beat"*) is a modern, responsive, dark-themed music streaming web application built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**. It connects to real, authorized music and podcast metadata and audio sources across multiple languages with genuine audio streaming capabilities.

---

## 🌟 Key Features

### 1. 🎧 Real Audio Playback & Persistent Music Player
- **HTML5 Web Audio Player**: Synchronized playback that persists uninterrupted while navigating between pages.
- **Controls**: Play/Pause, Next Track, Previous Track, Seekbar scrubbing with hover time, Volume slider, Mute toggle, Shuffle, and Repeat (`Off`, `All`, `One`).
- **Live Visualizer**: Dynamic animated audio spectrum bars synchronized to playing state.
- **Up Next Queue**: Slide-over queue drawer to view, reorder, or remove upcoming songs.
- **Immersive Now Playing Modal**: Expanded full-screen view featuring high-res artwork, ambient blurred backdrop, and track details.
- **Keyboard Shortcuts**:
  - `Space`: Play / Pause
  - `ArrowLeft` / `ArrowRight`: Seek backward / forward by 5 seconds
  - `Ctrl + ArrowLeft` / `Ctrl + ArrowRight`: Previous / Next track
  - `M`: Toggle Mute

### 2. 🌍 Multilingual Music Discovery
Dedicated discovery hub supporting **12+ languages**:
- **Indian Languages**: Tamil, Telugu, Malayalam, Kannada, Hindi, Bengali, Marathi, Punjabi.
- **Global Languages**: English, Korean (K-Pop), Japanese (J-Pop/Anime), Spanish (Latin Hits).
- Filter songs and regional podcasts by language.
- Pin your preferred languages to create quick-access chips on the top navigation bar.

### 3. 🎙️ Real Podcasts & Audio Shows
- Browse podcast shows by category: *Technology & AI*, *Music & Culture*, *Storytelling*, *Daily News*, *Comedy*, and *Science*.
- Click any show to inspect real episode feeds with descriptions, release dates, and direct streamable MP3 audio.

### 4. 🔍 Instant Debounced Search
- Multi-provider search across songs, artists, albums, podcasts, and Creative Commons archives.
- Filter by *All*, *Songs*, *Podcasts*, or *Archive / Full Track (CC)*.
- Real-time debouncing (450ms) to respect provider rate limits and avoid redundant API requests.

### 5. 📚 Guest Mode Library & Playlists (No Login Required)
- **Liked Songs**: 1-click heart toggle on cards, tables, and players.
- **Custom Playlists**: Create, rename, and delete playlists; add and remove tracks.
- **Recently Played**: Automatically logs your listening history.
- **Persistence**: All library data and volume preferences are stored locally in the browser's `localStorage` (`vibeesh_library_data_v1`).

---

### 🔍 GitHub API Client Compatibility Analysis

1. **`Borewit/musicbrainz-api` (Integrated via npm: `musicbrainz-api`)**:
   - **Status**: **Fully compatible & integrated.**
   - **Evaluation**: Actively maintained (v2.0.1+), pure TypeScript, ESM support, with smart client-side rate limiting (1 request/second) adhering to MusicBrainz guidelines. Used in `src/services/MusicBrainzProvider.ts` for artist search, biography lookup, and recording metadata.
2. **`vincent/node-jamendo` (Evaluated)**:
   - **Status**: **Incompatible with client-side Vite/Browser — Official v3 REST API directly integrated.**
   - **Evaluation**: The `vincent/node-jamendo` package relies on Node.js-only modules (`request@2.88.2`, Node `stream`, `fs.createWriteStream`). Installing it introduces 6 npm vulnerabilities (including 2 critical CVEs) and breaks browser bundles.
   - **Solution**: Following project instructions, VIBEESH directly implements a lightweight, zero-vulnerability TypeScript client for **Jamendo's official v3 REST API** ([JamendoProvider.ts](file:///e:/project/src/services/JamendoProvider.ts)) with full support for high-quality audio streams (`mp32`), search, and credential testing.

---

### 🔑 How to Register for a Jamendo Client ID

1. Open the [Jamendo Developer Portal](https://developer.jamendo.com/v3.0).
2. Create a free Jamendo account and log in.
3. Click on **My Applications** &rarr; **New Application**.
4. Set the Application Name to `VIBEESH` and submit the form.
5. Copy your unique **Client ID**.
6. In **VIBEESH**, click the **Admin Settings (🔒)** button in the sidebar (or the shield/lock icon in the navbar), sign in with administrator credentials (`admin` / `admin`), paste your key, click **Test Key** to verify authorization, and click **Save Key**.

---

### 🛡️ Browser-Based Admin Portal & Protected Settings
To ensure system stability and isolate sensitive provider configurations from regular guest visitors, **Settings** are strictly protected behind a browser-based administrator authentication layer:
- **Guest Access**: General users can stream music, discover multilingual playlists, listen to podcasts, like songs, and create local playlists in Guest Mode without logging in.
- **Administrator Access**:
  - **Login Entry**: Click **Admin Settings (🔒)** in the sidebar or navbar to open the **Administrator Sign In** portal.
  - **Default Credentials**:
    - **Username**: `admin`
    - **Password**: `admin` (or `vibeesh@admin`)
  - **Admin-Only Features**:
    - Manage and test Jamendo Developer Client IDs.
    - Inspect real-time provider statuses (Jamendo, MusicBrainz, Archive.org, Apple Podcasts).
    - Hard-reset local caches and application storage.
    - Change administrator password directly in the Admin Settings panel.
    - Persistent admin session stored securely in browser `localStorage` (`vibeesh_admin_session`).

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18 or higher recommended, tested on v22.16)
- **npm** (v9 or higher)

### 1. Installation
In the project directory, install dependencies:
```bash
npm install
```

### 2. Start Development Server
Launch the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173/`.

### 3. Production Build
Verify type checks and build the production bundle:
```bash
npm run build
```
The compiled assets will be output to the `dist/` folder.

To preview the production build locally:
```bash
npm run preview
```

---

## 📁 Project Architecture

```
e:/project/
├── index.html                   # HTML5 shell with Google Fonts & metadata
├── vite.config.ts               # Vite configuration with React & Tailwind plugins
├── package.json                 # Dependencies and build scripts
├── src/
│   ├── main.tsx                 # App mount point
│   ├── App.tsx                  # Router & Global Context Providers
│   ├── index.css                # Tailwind styling, dark theme tokens & audio animations
│   ├── types/
│   │   └── index.ts             # TypeScript definitions (Track, Artist, Album, Podcast, Playlist)
│   ├── data/
│   │   └── languages.ts         # Multilingual configuration (Tamil, Telugu, Hindi, etc.)
│   ├── services/
│   │   ├── iTunesProvider.ts    # Apple Music & Podcast API integration
│   │   ├── ArchiveOrgProvider.ts# Internet Archive open audio & 78rpm collection
│   │   ├── JamendoProvider.ts   # Jamendo Creative Commons music provider
│   │   ├── MusicBrainzProvider.ts# MusicBrainz encyclopedic metadata & CAA
│   │   └── MusicService.ts      # Provider aggregator with in-memory TTL caching
│   ├── context/
│   │   ├── PlayerContext.tsx    # Complete HTML5 audio player state & keyboard controls
│   │   └── LibraryContext.tsx   # Likes, playlists, history & localStorage persistence
│   ├── components/
│   │   ├── Layout/              # Sidebar, Navbar, BottomNav, AppLayout
│   │   ├── Player/              # PersistentPlayer, NowPlayingModal, QueueDrawer
│   │   ├── Cards/               # TrackCard, TrackRow, PodcastCard, ArtistCard, LanguageCard
│   │   ├── Modals/              # CreatePlaylistModal, AddToPlaylistModal, SettingsModal, PodcastEpisodesModal
│   │   └── Common/              # Badge, EmptyState, ErrorMessage, SkeletonCard
│   └── pages/
│       ├── HomePage.tsx         # Discovery feed, featured banner, podcasts
│       ├── SearchPage.tsx       # Real-time multi-provider debounced search
│       ├── NewReleasesPage.tsx  # Fresh provider singles & releases
│       ├── TrendingPage.tsx     # Ranked chart hits with Play All
│       ├── LanguagesPage.tsx    # Multilingual hub for 12+ languages
│       ├── PodcastsPage.tsx     # Category-based podcast directory & episode streaming
│       ├── ArtistDetailPage.tsx # Artist profile & top popular tracks
│       ├── AlbumDetailPage.tsx  # Album artwork & full tracklist
│       ├── LibraryPage.tsx      # Liked songs, custom playlists, recent history
│       └── NowPlayingPage.tsx   # Dedicated full-page audio visualizer & player
```

---

## 🎨 Branding & Design Philosophy
**VIBEESH** — *"Feel every Beat"* features its own distinct identity:
- **Logo**: Custom neon blue & purple gradient emblem with audio spectrum waves and musical note (from `logo image/`).
- **Color Palette**: Deep dark background (`#0a0b0e`), elevated surface cards (`#13151c`), electric emerald accents (`#10b981`), deep purple highlights (`#8b5cf6`), and neon gradients.
- **Glassmorphism**: Backdrop blur overlays for navigation bars, modals, and player.
- **Micro-Interactions**: Hover scale effects, play button transitions, and multi-bar audio spectrum animations.
- **Full Responsiveness**: Seamless desktop layout with a sidebar and mobile layout with bottom navigation.
