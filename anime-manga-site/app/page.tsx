'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AnimeCard from '@/components/AnimeCard';
import MangaCard from '@/components/MangaCard';
import Loading, { SkeletonGrid } from '@/components/Loading';
import { animeApi, mangaApi } from '@/lib/api';
import type { Anime, Manga } from '@/types';

export default function Home() {
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const [seasonalAnime, setSeasonalAnime] = useState<Anime[]>([]);
  const [popularManga, setPopularManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data in parallel
        const [topAnimeRes, seasonalAnimeRes, popularMangaRes] = await Promise.all([
          animeApi.getTopAnime(1, 12),
          animeApi.getSeasonalAnime(),
          mangaApi.getPopularManga(12, 0),
        ]);

        setTopAnime(topAnimeRes.data || []);
        setSeasonalAnime(seasonalAnimeRes.data?.slice(0, 12) || []);
        setPopularManga(popularMangaRes.data || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-background"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            مرحباً بك في عالم الأنمي والمانغا
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            شاهد أفضل الأنميات واقرأ أروع المانغا مع تحديثات يومية
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/anime"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-bold text-white hover:scale-105 transition-transform duration-200"
            >
              تصفح الأنمي
            </Link>
            <Link
              href="/manga"
              className="px-8 py-4 glass rounded-full font-bold text-white hover:scale-105 transition-transform duration-200"
            >
              تصفح المانغا
            </Link>
          </div>
        </motion.div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-500 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Top Anime Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold gradient-text">أفضل الأنميات</h2>
            <Link
              href="/anime"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              عرض الكل ←
            </Link>
          </div>
          
          {loading ? (
            <SkeletonGrid count={12} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topAnime.map((anime, index) => (
                <AnimeCard key={anime.mal_id} anime={anime} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Seasonal Anime Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold gradient-text">أنمي الموسم الحالي</h2>
            <Link
              href="/anime?filter=seasonal"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              عرض الكل ←
            </Link>
          </div>
          
          {loading ? (
            <SkeletonGrid count={12} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {seasonalAnime.map((anime, index) => (
                <AnimeCard key={anime.mal_id} anime={anime} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Popular Manga Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold gradient-text">مانغا شائعة</h2>
            <Link
              href="/manga"
              className="text-pink-400 hover:text-pink-300 transition-colors"
            >
              عرض الكل ←
            </Link>
          </div>
          
          {loading ? (
            <SkeletonGrid count={12} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {popularManga.map((manga, index) => (
                <MangaCard key={manga.id} manga={manga} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold gradient-text text-center mb-12">
            لماذا تختار موقعنا؟
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass p-6 rounded-lg text-center"
            >
              <div className="text-5xl mb-4">🎬</div>
              <h3 className="text-xl font-bold mb-2 text-purple-400">مكتبة ضخمة</h3>
              <p className="text-gray-400">
                آلاف الأنميات والمانغا من جميع الأنواع والتصنيفات
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass p-6 rounded-lg text-center"
            >
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="text-xl font-bold mb-2 text-pink-400">تحديثات يومية</h3>
              <p className="text-gray-400">
                محتوى جديد يضاف يومياً مع أحدث الحلقات والفصول
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass p-6 rounded-lg text-center"
            >
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2 text-blue-400">جودة عالية</h3>
              <p className="text-gray-400">
                مشاهدة وقراءة بجودة عالية مع واجهة سهلة الاستخدام
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
