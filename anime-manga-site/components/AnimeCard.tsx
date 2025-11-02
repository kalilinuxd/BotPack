'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Anime } from '@/types';

interface AnimeCardProps {
  anime: Anime;
  index?: number;
}

export default function AnimeCard({ anime, index = 0 }: AnimeCardProps) {
  const imageUrl = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || '/placeholder.jpg';
  const title = anime.title_english || anime.title || 'Unknown';
  const score = anime.score ? anime.score.toFixed(1) : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <Link href={`/anime/${anime.mal_id}`}>
        <div className="relative overflow-hidden rounded-lg glass card-hover">
          {/* Image */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Score Badge */}
            {anime.score && (
              <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-md text-sm font-bold flex items-center gap-1">
                ⭐ {score}
              </div>
            )}

            {/* Status Badge */}
            {anime.airing && (
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold animate-pulse">
                يُعرض الآن
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1 group-hover:text-purple-400 transition-colors">
              {title}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{anime.type || 'TV'}</span>
              {anime.episodes && (
                <span>{anime.episodes} حلقة</span>
              )}
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {anime.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre.mal_id}
                    className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Hover Info */}
          <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <p className="text-white text-xs line-clamp-3 mb-2">
              {anime.synopsis || 'لا يوجد وصف متاح'}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
