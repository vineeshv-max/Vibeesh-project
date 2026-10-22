import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { PersistentPlayer } from '../Player/PersistentPlayer';
import { QueueDrawer } from '../Player/QueueDrawer';
import { NowPlayingModal } from '../Player/NowPlayingModal';
import { CreatePlaylistModal } from '../Modals/CreatePlaylistModal';
import { AddToPlaylistModal } from '../Modals/AddToPlaylistModal';
import { SettingsModal } from '../Modals/SettingsModal';
import { AdminLoginModal } from '../Modals/AdminLoginModal';
import { PodcastEpisodesModal } from '../Modals/PodcastEpisodesModal';
import { YouTubeEmbedModal } from '../Player/YouTubeEmbedModal';
import { PlaylistImporterModal } from '../Modals/PlaylistImporterModal';
import { usePlayer } from '../../context/PlayerContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import type { Track, Podcast } from '../../types';

export const AppLayout: React.FC = () => {
  const { currentTrack } = usePlayer();
  const { isAdmin } = useAdminAuth();

  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isPlaylistImporterOpen, setIsPlaylistImporterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [youTubeTrack, setYouTubeTrack] = useState<Track | null>(null);

  const handleOpenSettings = () => {
    if (isAdmin) {
      setIsSettingsOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0b0e] text-zinc-100 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
          onOpenSettings={handleOpenSettings}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar onOpenSettings={handleOpenSettings} />

        <main
          className={`flex-1 overflow-y-auto overflow-x-hidden ${
            currentTrack ? 'pb-36 md:pb-28' : 'pb-20 md:pb-6'
          }`}
        >
          <Outlet
            context={{
              onOpenAddToPlaylist: (track: Track) => setAddToPlaylistTrack(track),
              onSelectPodcast: (podcast: Podcast) => setSelectedPodcast(podcast),
              onOpenCreatePlaylist: () => setIsCreatePlaylistOpen(true),
              onOpenPlaylistImporter: () => setIsPlaylistImporterOpen(true),
              onOpenYouTubeEmbed: (track: Track) => setYouTubeTrack(track),
              onOpenSettings: handleOpenSettings,
            }}
          />
        </main>
      </div>

      {/* Mobile Navigation */}
      <BottomNav />

      {/* Persistent Bottom Audio Player */}
      <PersistentPlayer onOpenYouTubeEmbed={(track) => setYouTubeTrack(track)} />

      {/* Sliding Queue Drawer */}
      <QueueDrawer />

      {/* Immersive Now Playing Modal */}
      <NowPlayingModal onOpenYouTubeEmbed={(track) => setYouTubeTrack(track)} />

      {/* Modals */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />

      <PlaylistImporterModal
        isOpen={isPlaylistImporterOpen}
        onClose={() => setIsPlaylistImporterOpen(false)}
      />

      <YouTubeEmbedModal
        track={youTubeTrack}
        onClose={() => setYouTubeTrack(null)}
      />

      <AddToPlaylistModal
        isOpen={Boolean(addToPlaylistTrack)}
        track={addToPlaylistTrack}
        onClose={() => setAddToPlaylistTrack(null)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenLogin={() => {
          setIsSettingsOpen(false);
          setIsAdminLoginOpen(true);
        }}
      />

      <PodcastEpisodesModal
        podcast={selectedPodcast}
        onClose={() => setSelectedPodcast(null)}
      />
    </div>
  );
};
