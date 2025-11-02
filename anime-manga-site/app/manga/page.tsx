'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MangaCard from '@/components/MangaCard';
import SearchBar from '@/components/SearchBar';
import Loading, { SkeletonGrid } from '@/components/Loading';
import { mangaApi } from '@/lib/api';
import type { Manga } from '@/types';

export default function MangaPage() {
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 24;

  useEffect(() => {
    fetchManga();
  }, [offset]);

  const fetchManga = async () => {
    try {
      setLoading(true);
      
      const response = await mangaApi.getPopularManga(limit, offset);
      setMangaList(response.data || []);
      setHasMore((response.total || 0) > offset + limit);
    } catch (error) {
      console.error('Error fetching manga:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setLoading(true);
      setSearchQuery(query);
      
      const response = await mangaApi.searchManga(query, limit, 0);
      setMangaList(response.data || []);
      setHasMore((response.total || 0) > limit);
      setOffset(0);
    } catch (error) {
      console.error('Error searching manga:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    setOffset(prev => prev + limit);
  };

  const handlePrevPage = () => {
    setOffset(prev => Math.max(0, prev - limit));
  };

  const currentPage = Math.floor(offset / limit) + 1;

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
            مكتبة المانغا
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            اقرأ آلاف المانغا من جميع الأنواع
          </p>
          
          <SearchBar
            onSearch={handleSearch}
            placeholder="ابحث عن مانغا..."
          />
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
        ) : mangaList.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mangaList.map((manga, index) => (
                <MangaCard key={manga.id} manga={manga} index={index} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex gap-4 justify-center mt-12">
              <button
                onClick={handlePrevPage}
                disabled={offset === 0}
                className="px-6 py-3 glass rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-500/20 transition-colors"
              >
                ← السابق
              </button>
              <span className="px-6 py-3 glass rounded-lg font-bold">
                صفحة {currentPage}
              </span>
              <button
                onClick={handleNextPage}
                disabled={!hasMore}
                className="px-6 py-3 glass rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-500/20 transition-colors"
              >
                التالي →
              </button>
            </div>
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
