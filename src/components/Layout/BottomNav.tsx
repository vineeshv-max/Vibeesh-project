import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Globe2, Mic, Library } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export const BottomNav: React.FC = () => {
  const { currentTrack } = usePlayer();

  const navItems = [
    { label: 'Home', icon: Home, to: '/' },
    { label: 'Search', icon: Search, to: '/search' },
    { label: 'Languages', icon: Globe2, to: '/languages' },
    { label: 'Podcasts', icon: Mic, to: '/podcasts' },
    { label: 'Library', icon: Library, to: '/library' },
  ];

  return (
    <nav
      className={`md:hidden fixed left-0 right-0 z-30 bg-[#0e1017]/95 backdrop-blur-xl border-t border-white/10 transition-all ${
        currentTrack ? 'bottom-[68px]' : 'bottom-0'
      }`}
    >
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
