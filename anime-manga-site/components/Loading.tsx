'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        className="relative w-20 h-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-purple-500/30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500"></div>
      </motion.div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-lg glass">
      <div className="relative aspect-[2/3] skeleton"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton rounded"></div>
        <div className="h-3 skeleton rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
