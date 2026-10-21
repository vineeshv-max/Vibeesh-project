import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Mic, Radio } from 'lucide-react';
import { MusicService } from '../services/MusicService';
import type { Podcast } from '../types';
import { PodcastCard } from '../components/Cards/PodcastCard';
import { SkeletonCard } from '../components/Common/SkeletonCard';
import { ErrorMessage } from '../components/Common/ErrorMessage';

interface OutletContextType {
  onSelectPodcast: (podcast: Podcast) => void;
}

export const PodcastsPage: React.FC = () => {
  const { onSelectPodcast } = useOutletContext<OutletContextType>();

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('technology');

  const categories = [
    { id: 'technology', label: 'Tech & AI' },
    { id: 'music discussion', label: 'Music & Culture' },
    { id: 'storytelling', label: 'Stories & Narrative' },
    { id: 'news world', label: 'Daily News' },
    { id: 'comedy banter', label: 'Comedy' },
    { id: 'science education', label: 'Science & Cosmos' },
  ];

  const fetchPodcasts = (cat: string) => {
    setLoading(true);
    setError(null);

    MusicService.getPodcastsByCategory(cat, 18)
      .then((data) => {
        setPodcasts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load podcasts from provider feeds.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPodcasts(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#181324] to-[#11131c] border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold uppercase tracking-wider">
            <Mic className="w-3.5 h-3.5" />
            Original Audio Shows & Feeds
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Podcasts Universe
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Listen to conversations, discussions, and full episodes with genuine MP3 streams.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/40 border border-purple-500/20 px-3.5 py-2 rounded-2xl">
          <Radio className="w-4 h-4 animate-pulse" />
          Streamable RSS & Directory Enclosures
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-colors ${
              selectedCategory === c.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-[#141620] text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} onRetry={() => fetchPodcasts(selectedCategory)} />}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {loading
          ? [...Array(12)].map((_, i) => <SkeletonCard key={i} />)
          : podcasts.map((pod) => (
              <PodcastCard
                key={pod.id}
                podcast={pod}
                onClick={(p) => onSelectPodcast(p)}
              />
            ))}
      </div>
    </div>
  );
};
