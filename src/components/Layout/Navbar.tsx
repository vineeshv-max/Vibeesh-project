import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
  Sparkles,
  User,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { LANGUAGES } from '../../data/languages';

interface NavbarProps {
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { preferredLanguages } = useLibrary();
  const { isAdmin } = useAdminAuth();
  const [quickQuery, setQuickQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickQuery.trim())}`);
    }
  };

  const isSearchPage = location.pathname.startsWith('/search');

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0a0b0e]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Navigation History & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile Brand Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex md:hidden items-center gap-2 cursor-pointer shrink-0"
        >
          <img
            src="/logo.jpeg"
            alt="VIBEESH"
            className="w-8 h-8 rounded-xl object-cover border border-purple-500/30 shadow-md"
          />
          <span className="font-black text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            VIBEESH
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="p-1.5 rounded-full bg-[#141620] hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(1)}
            aria-label="Go forward"
            className="p-1.5 rounded-full bg-[#141620] hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Global Quick Search */}
        {!isSearchPage && (
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="What do you want to play?"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#141620] border border-white/10 text-xs sm:text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500/50 focus:bg-[#181a26] transition-all"
            />
          </form>
        )}
      </div>

      {/* Right Controls: Preferred Languages, Settings, Guest Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Preferred Languages Quick Filters */}
        <div className="hidden md:flex items-center gap-1.5">
          {preferredLanguages.slice(0, 3).map((code) => {
            const lang = LANGUAGES.find((l) => l.code === code);
            if (!lang) return null;
            return (
              <button
                key={code}
                onClick={() => navigate(`/languages?code=${code}`)}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#141620] hover:bg-emerald-500/15 hover:text-emerald-400 border border-white/5 transition-colors text-zinc-300"
              >
                {lang.name}
              </button>
            );
          })}
        </div>

        {/* Explore Languages Button */}
        <button
          onClick={() => navigate('/languages')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/10 to-emerald-500/10 hover:from-purple-500/20 hover:to-emerald-500/20 border border-purple-500/20 text-purple-300 transition-all hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Multilingual
        </button>

        {/* Provider Settings (Protected by Admin Auth) */}
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className={`p-2 rounded-full transition-all border ${
            isAdmin
              ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/50 hover:text-white shadow-sm shadow-purple-900/30'
              : 'bg-[#141620] hover:bg-white/10 text-zinc-400 hover:text-white border-white/5'
          }`}
          title={isAdmin ? 'Administrator Settings & APIs' : 'Administrator Login Required'}
        >
          {isAdmin ? <ShieldCheck className="w-4 h-4 text-purple-400" /> : <Lock className="w-4 h-4" />}
        </button>

        {/* Profile / Admin Status Badge */}
        {isAdmin ? (
          <div
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-full bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/40 hover:border-purple-400/60 cursor-pointer transition-all shadow-md shadow-purple-950/40 hover:scale-105"
            title="Administrator session active. Click to open settings."
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 flex items-center justify-center text-white font-bold text-xs shadow">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-purple-200 hidden sm:inline">Admin</span>
          </div>
        ) : (
          <div
            onClick={() => navigate('/library')}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-[#141620] border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-colors"
            title="Guest Mode (Local Library)"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-bold text-xs">
              <User className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-xs font-medium text-zinc-200 hidden sm:inline">Guest</span>
          </div>
        )}
      </div>
    </header>
  );
};
