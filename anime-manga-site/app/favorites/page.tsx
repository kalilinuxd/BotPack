'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AnimeCard from '@/components/AnimeCard';
import MangaCard from '@/components/MangaCard';
import Loading, { SkeletonGrid } from '@/components/Loading';
import { animeApi, mangaApi, favoritesApi } from '@/lib/api';
import type { Anime, Manga } from '@/types';

export default function FavoritesPage() {
  const [favoriteAnime, setFavoriteAnime] = useState<Anime[]>([]);
  const [favoriteManga, setFavoriteManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'anime' | 'manga'>('anime');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      
      const animeIds = favoritesApi.getAnimeFavorites();
      const mangaIds = favoritesApi.getMangaFavorites();

      // Fetch anime details
      const animePromises = animeIds.map(id => 
        animeApi.getAnimeById(id).catch(() => null)
      );
      const animeResults = await Promise.all(animePromises);
      const animeData = animeResults
        .filter(result => result !== null)
        .map(result => result!.data);

      // Fetch manga details
      const mangaPromises = mangaIds.map(id => 
        mangaApi.getMangaById(id).catch(() => null)
      );
      const mangaResults = await Promise.all(mangaPromises);
      const mangaData = mangaResults
        .filter(result => result !== null)
        .map(result => result!.data);

      setFavoriteAnime(animeData);
      setFavoriteManga(mangaData);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
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
            ❤️ المفضلة
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            الأنمي والمانغا المفضلة لديك
          </p>

          {/* Tabs */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setActiveTab('anime')}
              className={`px-8 py-3 rounded-full font-bold transition-all duration-200 ${
                activeTab === 'anime'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'glass text-gray-300 hover:text-white'
              }`}
            >
              أنمي ({favoriteAnime.length})
            </button>
            <button
              onClick={() => setActiveTab('manga')}
              className={`px-8 py-3 rounded-full font-bold transition-all duration-200 ${
                activeTab === 'manga'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'glass text-gray-300 hover:text-white'
              }`}
            >
              مانغا ({favoriteManga.length})
            </button>
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <SkeletonGrid count={12} />
        ) : (
          <>
            {activeTab === 'anime' && (
              <>
                {favoriteAnime.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {favoriteAnime.map((anime, index) => (
                      <AnimeCard key={anime.mal_id} anime={anime} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">💔</div>
                    <p className="text-2xl text-gray-400 mb-2">لا توجد أنميات مفضلة</p>
                    <p className="text-gray-500">ابدأ بإضافة أنميات إلى قائمة المفضلة</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'manga' && (
              <>
                {favoriteManga.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {favoriteManga.map((manga, index) => (
                      <MangaCard key={manga.id} manga={manga} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">💔</div>
                    <p className="text-2xl text-gray-400 mb-2">لا توجد مانغا مفضلة</p>
                    <p className="text-gray-500">ابدأ بإضافة مانغا إلى قائمة المفضلة</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
