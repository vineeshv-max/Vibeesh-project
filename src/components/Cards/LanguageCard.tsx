import React from 'react';
import { Play, Sparkles, Check } from 'lucide-react';
import type { LanguageOption } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';

interface LanguageCardProps {
  language: LanguageOption;
  onQuickPlay?: () => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({ language, onQuickPlay }) => {
  const navigate = useNavigate();
  const { isPreferredLanguage, togglePreferredLanguage } = useLibrary();
  const isPref = isPreferredLanguage(language.code);

  return (
    <div
      onClick={() => navigate(`/languages?code=${language.code}`)}
      className={`group relative overflow-hidden rounded-2xl p-5 border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl bg-gradient-to-br ${language.accentColor} border-white/10`}
    >
      {/* Decorative ambient background text / native name watermark */}
      <span className="absolute -bottom-4 -right-2 text-7xl font-bold opacity-15 select-none text-white pointer-events-none transition-transform group-hover:scale-110">
        {language.nativeName}
      </span>

      <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-2xl font-bold text-white block mb-0.5">
              {language.nativeName}
            </span>
            <span className="text-sm font-medium text-white/80 tracking-wide">
              {language.name}
            </span>
          </div>

          {/* Toggle favorite language badge */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePreferredLanguage(language.code);
            }}
            title={isPref ? 'Preferred language' : 'Add to favorite languages'}
            className={`px-2 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 backdrop-blur-md transition-colors ${
              isPref
                ? 'bg-white/30 text-white font-semibold'
                : 'bg-black/20 text-white/70 hover:bg-black/30'
            }`}
          >
            {isPref ? <Check className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
            {isPref ? 'Saved' : 'Pin'}
          </button>
        </div>

        <p className="text-xs text-white/80 line-clamp-2 my-2 font-light">
          {language.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] font-medium text-white/70 group-hover:text-white transition-colors">
            Explore Music &rarr;
          </span>

          {onQuickPlay && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickPlay();
              }}
              aria-label={`Play ${language.name} hits`}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
