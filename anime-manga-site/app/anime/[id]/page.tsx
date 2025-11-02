'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import AnimeCard from '@/components/AnimeCard';
import Loading from '@/components/Loading';
import { animeApi, favoritesApi } from '@/lib/api';
import type { Anime } from '@/types';

export default function AnimeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [anime, setAnime] = useState<Anime | null>(null);
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAnimeDetails();
      setIsFavorite(favoritesApi.isAnimeFavorite(Number(id)));
    }
  }, [id]);

  const fetchAnimeDetails = async () => {
    try {
      setLoading(true);
      
      const [animeRes, recommendationsRes, episodesRes] = await Promise.all([
        animeApi.getAnimeById(Number(id)),
        animeApi.getAnimeRecommendations(Number(id)),
        animeApi.getAnimeEpisodes(Number(id)),
      ]);

      setAnime(animeRes.data);
      setRecommendations(recommendationsRes.data?.slice(0, 12).map((r: any) => r.entry) || []);
      setEpisodes(episodesRes.data || []);
    } catch (error) {
      console.error('Error fetching anime details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      favoritesApi.removeAnimeFavorite(Number(id));
    } else {
      favoritesApi.addAnimeFavorite(Number(id));
    }
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return <Loading />;
  }

  if (!anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-400">لم يتم العثور على الأنمي</p>
      </div>
    );
  }

  const imageUrl = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        {imageUrl && (
          <>
            <div className="absolute inset-0">
              <Image
                src={imageUrl}
                alt={anime.title}
                fill
                className="object-cover blur-2xl opacity-30"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          </>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-end pb-12">
          <div className="flex gap-8 items-end">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden md:block relative w-64 h-96 rounded-lg overflow-hidden glass flex-shrink-0"
            >
              <Image
                src={imageUrl}
                alt={anime.title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                {anime.title_english || anime.title}
              </h1>
              {anime.title_japanese && (
                <p className="text-xl text-gray-400 mb-4">{anime.title_japanese}</p>
              )}

              <div className="flex flex-wrap gap-4 mb-4">
                {anime.score && (
                  <div className="flex items-center gap-2 glass px-4 py-2 rounded-lg">
                    <span className="text-2xl">⭐</span>
                    <span className="text-xl font-bold">{anime.score.toFixed(1)}</span>
                  </div>
                )}
                {anime.rank && (
                  <div className="glass px-4 py-2 rounded-lg">
                    <span className="text-gray-400">الترتيب: </span>
                    <span className="font-bold">#{anime.rank}</span>
                  </div>
                )}
                {anime.popularity && (
                  <div className="glass px-4 py-2 rounded-lg">
                    <span className="text-gray-400">الشعبية: </span>
                    <span className="font-bold">#{anime.popularity}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {anime.genres?.map((genre) => (
                  <span
                    key={genre.mal_id}
                    className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <button
                onClick={toggleFavorite}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                  isFavorite
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    : 'glass text-white hover:bg-purple-500/20'
                }`}
              >
                {isFavorite ? '❤️ في المفضلة' : '🤍 أضف للمفضلة'}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Synopsis */}
            <div className="glass p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 gradient-text">القصة</h2>
              <p className="text-gray-300 leading-relaxed">
                {anime.synopsis || 'لا يوجد وصف متاح'}
              </p>
            </div>

            {/* Trailer */}
            {anime.trailer?.embed_url && (
              <div className="glass p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 gradient-text">الإعلان</h2>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={anime.trailer.embed_url}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Episodes */}
            {episodes.length > 0 && (
              <div className="glass p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 gradient-text">الحلقات</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {episodes.slice(0, 24).map((episode) => (
                    <div
                      key={episode.mal_id}
                      className="glass p-3 rounded-lg hover:bg-purple-500/20 transition-colors cursor-pointer"
                    >
                      <p className="font-bold">حلقة {episode.episode}</p>
                      <p className="text-sm text-gray-400 line-clamp-1">{episode.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 gradient-text">معلومات</h3>
              <div className="space-y-3 text-sm">
                {anime.type && (
                  <div>
                    <span className="text-gray-400">النوع: </span>
                    <span className="font-bold">{anime.type}</span>
                  </div>
                )}
                {anime.episodes && (
                  <div>
                    <span className="text-gray-400">الحلقات: </span>
                    <span className="font-bold">{anime.episodes}</span>
                  </div>
                )}
                {anime.status && (
                  <div>
                    <span className="text-gray-400">الحالة: </span>
                    <span className="font-bold">{anime.status}</span>
                  </div>
                )}
                {anime.aired?.string && (
                  <div>
                    <span className="text-gray-400">تاريخ العرض: </span>
                    <span className="font-bold">{anime.aired.string}</span>
                  </div>
                )}
                {anime.season && anime.year && (
                  <div>
                    <span className="text-gray-400">الموسم: </span>
                    <span className="font-bold capitalize">{anime.season} {anime.year}</span>
                  </div>
                )}
                {anime.studios && anime.studios.length > 0 && (
                  <div>
                    <span className="text-gray-400">الاستوديو: </span>
                    <span className="font-bold">{anime.studios.map(s => s.name).join(', ')}</span>
                  </div>
                )}
                {anime.duration && (
                  <div>
                    <span className="text-gray-400">المدة: </span>
                    <span className="font-bold">{anime.duration}</span>
                  </div>
                )}
                {anime.rating && (
                  <div>
                    <span className="text-gray-400">التصنيف: </span>
                    <span className="font-bold">{anime.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 gradient-text">أنميات مشابهة</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.map((rec, index) => (
                <AnimeCard key={rec.mal_id} anime={rec} index={index} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
