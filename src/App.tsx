import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { LibraryProvider } from './context/LibraryContext';
import { AppLayout } from './components/Layout/AppLayout';

import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { NewReleasesPage } from './pages/NewReleasesPage';
import { TrendingPage } from './pages/TrendingPage';
import { LanguagesPage } from './pages/LanguagesPage';
import { PodcastsPage } from './pages/PodcastsPage';
import { ArtistDetailPage } from './pages/ArtistDetailPage';
import { AlbumDetailPage } from './pages/AlbumDetailPage';
import { LibraryPage } from './pages/LibraryPage';
import { NowPlayingPage } from './pages/NowPlayingPage';

export function App() {
  return (
    <AdminAuthProvider>
      <PlayerProvider>
        <LibraryProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="new-releases" element={<NewReleasesPage />} />
                <Route path="trending" element={<TrendingPage />} />
                <Route path="languages" element={<LanguagesPage />} />
                <Route path="podcasts" element={<PodcastsPage />} />
                <Route path="artists/:name" element={<ArtistDetailPage />} />
                <Route path="albums/:id" element={<AlbumDetailPage />} />
                <Route path="library" element={<LibraryPage />} />
                <Route path="now-playing" element={<NowPlayingPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </LibraryProvider>
      </PlayerProvider>
    </AdminAuthProvider>
  );
}

export default App;
