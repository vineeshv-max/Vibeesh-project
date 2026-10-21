import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Sparkles,
  Flame,
  Globe2,
  Mic,
  Library,
  PlusCircle,
  Heart,
  ShieldCheck,
  Lock,
  LogOut,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface SidebarProps {
  onOpenCreatePlaylist: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenCreatePlaylist,
  onOpenSettings,
}) => {
  const navigate = useNavigate();
  const { playlists, likedTracks } = useLibrary();
  const { isAdmin, logout } = useAdminAuth();

  const navItems = [
    { label: 'Home', icon: Home, to: '/' },
    { label: 'Search', icon: Search, to: '/search' },
    { label: 'New Releases', icon: Sparkles, to: '/new-releases' },
    { label: 'Trending', icon: Flame, to: '/trending' },
    { label: 'Languages', icon: Globe2, to: '/languages' },
    { label: 'Podcasts', icon: Mic, to: '/podcasts' },
    { label: 'Your Library', icon: Library, to: '/library' },
  ];

  return (
    <aside className="w-64 bg-[#0e1017] border-r border-white/5 flex flex-col h-full shrink-0 select-none">
      {/* Brand Logo */}
      <div
        onClick={() => navigate('/')}
        className="px-5 py-5 flex items-center gap-3.5 cursor-pointer group"
      >
        <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-purple-950/40 border border-purple-500/20 group-hover:scale-105 transition-transform bg-black shrink-0">
          <img
            src="/logo.jpeg"
            alt="VIBEESH Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 block leading-tight">
            VIBEESH
          </span>
          <span className="text-[11px] font-medium text-purple-300/80 tracking-wide block truncate">
            Feel every Beat
          </span>
        </div>
      </div>

      {/* Main Navigation links */}
      <nav className="px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/15 to-transparent text-emerald-400 font-semibold border-l-2 border-emerald-400'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="my-4 mx-4 border-t border-white/5" />

      {/* Playlists Quick Access */}
      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        <div className="flex items-center justify-between px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <span>Playlists</span>
          <button
            onClick={onOpenCreatePlaylist}
            className="p-1 rounded-lg hover:text-emerald-400 hover:bg-white/5 transition-colors"
            title="Create Playlist"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Liked songs item */}
        <div
          onClick={() => navigate('/library?tab=liked')}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow">
            <Heart className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="truncate">Liked Songs ({likedTracks.length})</span>
        </div>

        {/* Custom playlists list */}
        <div className="space-y-0.5">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => navigate(`/library?playlistId=${pl.id}`)}
              className="px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 truncate cursor-pointer transition-colors"
              title={pl.name}
            >
              {pl.name}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer / Settings */}
      <div className="p-3 border-t border-white/5 space-y-1.5">
        {isAdmin ? (
          <>
            <div className="px-1 py-0.5 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                  Admin Active
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign out of Admin session"
                className="text-[10px] text-zinc-400 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-200 bg-purple-950/30 border border-purple-500/25 hover:bg-purple-900/40 hover:border-purple-500/40 transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Admin Settings & APIs</span>
            </button>
          </>
        ) : (
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
            title="Administrator Sign In"
          >
            <div className="flex items-center gap-2.5">
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Admin Settings</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-purple-300 border border-purple-500/20">
              Sign In
            </span>
          </button>
        )}
      </div>
    </aside>
  );
};
