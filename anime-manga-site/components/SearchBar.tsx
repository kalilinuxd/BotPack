'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'ابحث...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-6 py-4 pr-12 rounded-full glass text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
          dir="rtl"
        />
        <button
          type="submit"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full hover:scale-110 transition-transform duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </motion.form>
  );
}
