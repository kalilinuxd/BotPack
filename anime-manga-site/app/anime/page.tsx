'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AnimeCard from '@/components/AnimeCard';
import SearchBar from '@/components/SearchBar';
import Loading, { SkeletonGrid } from '@/components/Loading';
import { animeApi } from '@/lib/api';
import type { Anime } from '@/types';

export default function AnimePage() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [filter, setFilter] = useState<'top' | 'seasonal'>('top');

  useEffect(() => {
    fetchAnime();
  }, [currentPage, filter]);

  const fetchAnime = async () => {
    try {
      setLoading(true);
      
      let response;
      if (filter === 'seasonal') {
        response = await animeApi.getSeasonalAnime();
      } else {
        response = await animeApi.getTopAnime(currentPage, 24);
      }

      setAnimeList(response.data || []);
      setHasNextPage(response.pagination?.has_next_page || false);
    } catch (error) {
      console.error('Error fetching anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setLoading(true);
      setSearchQuery(query);
      
      const response = await animeApi.searchAnime({
        q: query,
        page: 1,
        limit: 24,
      });

      setAnimeList(response.data || []);
      setHasNextPage(response.pagination?.has_next_page || false);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error searching anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: 'top' | 'seasonal') => {
    setFilter(newFilter);
    setCurrentPage(1);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto text-center"
        >
          <h1 className="text-5xl font-bold mb-6 gradient-text">
            مكتبة الأنمي
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            اكتشف آلاف الأنميات من جميع الأنواع
          </p>
          
          <SearchBar
            onSearch={handleSearch}
            placeholder="ابحث عن أنمي..."
          />

          {/* Filters */}
          <div className="flex gap-4 justify-center mt-8 flex-wrap">
            <button
              onClick={() => handleFilterChange('top')}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-200 ${
                filter === 'top'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'glass text-gray-300 hover:text-white'
              }`}
            >
              الأعلى تقييماً
            </button>
            <button
              onClick={() => handleFilterChange('seasonal')}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-200 ${
                filter === 'seasonal'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'glass text-gray-300 hover:text-white'
              }`}
            >
              الموسم الحالي
            </button>
          </div>
        </motion.div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        {searchQuery && (
          <p className="text-gray-400 mb-4">
            نتائج البحث عن: <span className="text-white font-bold">{searchQuery}</span>
          </p>
        )}

        {loading ? (
          <SkeletonGrid count={24} />
        ) : animeList.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {animeList.map((anime, index) => (
                <AnimeCard key={anime.mal_id} anime={anime} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {!searchQuery && (
              <div className="flex gap-4 justify-center mt-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 glass rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500/20 transition-colors"
                >
                  ← السابق
                </button>
                <span className="px-6 py-3 glass rounded-lg font-bold">
                  صفحة {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!hasNextPage}
                  className="px-6 py-3 glass rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500/20 transition-colors"
                >
                  التالي →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400">لم يتم العثور على نتائج</p>
          </div>
        )}
      </section>
    </div>
  );
}
