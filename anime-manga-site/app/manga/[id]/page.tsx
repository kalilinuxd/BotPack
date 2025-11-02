'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Loading from '@/components/Loading';
import { mangaApi, favoritesApi } from '@/lib/api';
import type { Manga, MangaChapter } from '@/types';

export default function MangaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<MangaChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMangaDetails();
      setIsFavorite(favoritesApi.isMangaFavorite(id));
    }
  }, [id]);

  const fetchMangaDetails = async () => {
    try {
      setLoading(true);
      
      const [mangaRes, chaptersRes] = await Promise.all([
        mangaApi.getMangaById(id),
        mangaApi.getMangaChapters(id, 50, 0),
      ]);

      setManga(mangaRes.data);
      setChapters(chaptersRes.data || []);
    } catch (error) {
      console.error('Error fetching manga details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      favoritesApi.removeMangaFavorite(id);
    } else {
      favoritesApi.addMangaFavorite(id);
    }
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return <Loading />;
  }

  if (!manga) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-400">لم يتم العثور على المانغا</p>
      </div>
    );
  }

  const title = manga.attributes.title.en || manga.attributes.title.ja || Object.values(manga.attributes.title)[0] || 'Unknown';
  const description = manga.attributes.description?.en || Object.values(manga.attributes.description || {})[0] || 'لا يوجد وصف متاح';
  
  const coverRelation = manga.relationships?.find(rel => rel.type === 'cover_art');
  const coverFileName = coverRelation?.attributes?.fileName;
  const coverUrl = coverFileName 
    ? mangaApi.getCoverUrl(manga.id, coverFileName, 'original')
    : '/placeholder.jpg';

  const author = manga.relationships?.find(rel => rel.type === 'author');
  const artist = manga.relationships?.find(rel => rel.type === 'artist');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover blur-2xl opacity-30"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-end pb-12">
          <div className="flex gap-8 items-end">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden md:block relative w-64 h-96 rounded-lg overflow-hidden glass flex-shrink-0"
            >
              <Image
                src={coverUrl}
                alt={title}
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
                {title}
              </h1>

              <div className="flex flex-wrap gap-4 mb-4">
                {manga.attributes.year && (
                  <div className="glass px-4 py-2 rounded-lg">
                    <span className="text-gray-400">السنة: </span>
                    <span className="font-bold">{manga.attributes.year}</span>
                  </div>
                )}
                {manga.attributes.status && (
                  <div className="glass px-4 py-2 rounded-lg">
                    <span className="text-gray-400">الحالة: </span>
                    <span className="font-bold capitalize">{manga.attributes.status}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {manga.attributes.tags?.slice(0, 5).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-sm"
                  >
                    {tag.attributes.name.en}
                  </span>
                ))}
              </div>

              <button
                onClick={toggleFavorite}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                  isFavorite
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    : 'glass text-white hover:bg-pink-500/20'
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
            {/* Description */}
            <div className="glass p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 gradient-text">القصة</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Chapters */}
            {chapters.length > 0 && (
              <div className="glass p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 gradient-text">الفصول</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="glass p-4 rounded-lg hover:bg-pink-500/20 transition-colors cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold">
                          {chapter.attributes.chapter ? `الفصل ${chapter.attributes.chapter}` : 'Oneshot'}
                        </p>
                        {chapter.attributes.title && (
                          <p className="text-sm text-gray-400">{chapter.attributes.title}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {chapter.attributes.pages} صفحة
                      </div>
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
                <div>
                  <span className="text-gray-400">النوع: </span>
                  <span className="font-bold capitalize">{manga.type || 'Manga'}</span>
                </div>
                {manga.attributes.status && (
                  <div>
                    <span className="text-gray-400">الحالة: </span>
                    <span className="font-bold capitalize">{manga.attributes.status}</span>
                  </div>
                )}
                {manga.attributes.year && (
                  <div>
                    <span className="text-gray-400">سنة الإصدار: </span>
                    <span className="font-bold">{manga.attributes.year}</span>
                  </div>
                )}
                {author && (
                  <div>
                    <span className="text-gray-400">المؤلف: </span>
                    <span className="font-bold">{author.attributes?.name || 'Unknown'}</span>
                  </div>
                )}
                {artist && artist.id !== author?.id && (
                  <div>
                    <span className="text-gray-400">الرسام: </span>
                    <span className="font-bold">{artist.attributes?.name || 'Unknown'}</span>
                  </div>
                )}
                {manga.attributes.contentRating && (
                  <div>
                    <span className="text-gray-400">التصنيف: </span>
                    <span className="font-bold capitalize">{manga.attributes.contentRating}</span>
                  </div>
                )}
                {chapters.length > 0 && (
                  <div>
                    <span className="text-gray-400">عدد الفصول: </span>
                    <span className="font-bold">{chapters.length}+</span>
                  </div>
                )}
              </div>
            </div>

            {/* Alternative Titles */}
            {manga.attributes.altTitles && manga.attributes.altTitles.length > 0 && (
              <div className="glass p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 gradient-text">عناوين بديلة</h3>
                <div className="space-y-2 text-sm">
                  {manga.attributes.altTitles.slice(0, 5).map((altTitle, index) => (
                    <div key={index} className="text-gray-300">
                      {Object.values(altTitle)[0]}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
