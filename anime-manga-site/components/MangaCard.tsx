'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Manga } from '@/types';
import { mangaApi } from '@/lib/api';

interface MangaCardProps {
  manga: Manga;
  index?: number;
}

export default function MangaCard({ manga, index = 0 }: MangaCardProps) {
  const title = manga.attributes.title.en || manga.attributes.title.ja || Object.values(manga.attributes.title)[0] || 'Unknown';
  
  // Get cover art
  const coverRelation = manga.relationships?.find(rel => rel.type === 'cover_art');
  const coverFileName = coverRelation?.attributes?.fileName;
  const coverUrl = coverFileName 
    ? mangaApi.getCoverUrl(manga.id, coverFileName, 'medium')
    : '/placeholder.jpg';

  // Get description
  const description = manga.attributes.description?.en || Object.values(manga.attributes.description || {})[0] || 'لا يوجد وصف متاح';

  // Get tags (genres)
  const tags = manga.attributes.tags?.slice(0, 2) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <Link href={`/manga/${manga.id}`}>
        <div className="relative overflow-hidden rounded-lg glass card-hover">
          {/* Image */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={coverUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Status Badge */}
            {manga.attributes.status === 'ongoing' && (
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                مستمر
              </div>
            )}
            {manga.attributes.status === 'completed' && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                مكتمل
              </div>
            )}

            {/* Year Badge */}
            {manga.attributes.year && (
              <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-md text-sm font-bold">
                {manga.attributes.year}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1 group-hover:text-pink-400 transition-colors">
              {title}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{manga.type || 'Manga'}</span>
              <span className="capitalize">{manga.attributes.status || 'N/A'}</span>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300"
                  >
                    {tag.attributes.name.en}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Hover Info */}
          <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <p className="text-white text-xs line-clamp-3 mb-2">
              {description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
