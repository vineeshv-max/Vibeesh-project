import React from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ArtistCardProps {
  id: string;
  name: string;
  image: string;
  genre?: string;
  onPlay?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ name, image, genre, onPlay }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/artists/${encodeURIComponent(name)}`)}
      className="group flex flex-col items-center text-center p-4 rounded-2xl bg-[#13151c]/70 hover:bg-[#181b24] border border-white/5 hover:border-emerald-500/20 transition-all duration-300 cursor-pointer hover:shadow-xl"
    >
      <div className="relative w-32 h-32 rounded-full overflow-hidden mb-3.5 bg-zinc-900 shadow-md">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {onPlay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            aria-label={`Play ${name}`}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:scale-110 active:scale-95"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        )}
      </div>

      <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-emerald-400 truncate w-full mb-1">
        {name}
      </h4>
      <p className="text-xs text-zinc-500 truncate w-full">
        {genre || 'Artist'}
      </p>
    </div>
  );
};
