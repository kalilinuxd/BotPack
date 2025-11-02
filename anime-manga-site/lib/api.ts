import axios from 'axios';
import type { Anime, Manga, JikanResponse, MangaDexResponse, SearchParams } from '@/types';

// API Base URLs
const JIKAN_API = 'https://api.jikan.moe/v4';
const MANGADEX_API = 'https://api.mangadex.org';

// Rate limiting helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Jikan API (Anime)
export const animeApi = {
  // Get top anime
  getTopAnime: async (page: number = 1, limit: number = 24) => {
    try {
      await delay(500); // Rate limiting
      const response = await axios.get<JikanResponse<Anime[]>>(
        `${JIKAN_API}/top/anime`,
        { params: { page, limit } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching top anime:', error);
      throw error;
    }
  },

  // Get seasonal anime
  getSeasonalAnime: async (year?: number, season?: string) => {
    try {
      await delay(500);
      const now = new Date();
      const currentYear = year || now.getFullYear();
      const currentSeason = season || getCurrentSeason();
      
      const response = await axios.get<JikanResponse<Anime[]>>(
        `${JIKAN_API}/seasons/${currentYear}/${currentSeason}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching seasonal anime:', error);
      throw error;
    }
  },

  // Search anime
  searchAnime: async (params: SearchParams) => {
    try {
      await delay(500);
      const response = await axios.get<JikanResponse<Anime[]>>(
        `${JIKAN_API}/anime`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching anime:', error);
      throw error;
    }
  },

  // Get anime by ID
  getAnimeById: async (id: number) => {
    try {
      await delay(500);
      const response = await axios.get<JikanResponse<Anime>>(
        `${JIKAN_API}/anime/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching anime details:', error);
      throw error;
    }
  },

  // Get anime episodes
  getAnimeEpisodes: async (id: number, page: number = 1) => {
    try {
      await delay(500);
      const response = await axios.get(
        `${JIKAN_API}/anime/${id}/episodes`,
        { params: { page } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching anime episodes:', error);
      throw error;
    }
  },

  // Get anime recommendations
  getAnimeRecommendations: async (id: number) => {
    try {
      await delay(500);
      const response = await axios.get(
        `${JIKAN_API}/anime/${id}/recommendations`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },
};

// MangaDex API (Manga)
export const mangaApi = {
  // Get popular manga
  getPopularManga: async (limit: number = 24, offset: number = 0) => {
    try {
      const response = await axios.get<MangaDexResponse<Manga[]>>(
        `${MANGADEX_API}/manga`,
        {
          params: {
            limit,
            offset,
            'order[followedCount]': 'desc',
            'contentRating[]': ['safe', 'suggestive'],
            includes: ['cover_art', 'author', 'artist'],
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching popular manga:', error);
      throw error;
    }
  },

  // Search manga
  searchManga: async (query: string, limit: number = 24, offset: number = 0) => {
    try {
      const response = await axios.get<MangaDexResponse<Manga[]>>(
        `${MANGADEX_API}/manga`,
        {
          params: {
            title: query,
            limit,
            offset,
            'contentRating[]': ['safe', 'suggestive'],
            includes: ['cover_art', 'author', 'artist'],
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching manga:', error);
      throw error;
    }
  },

  // Get manga by ID
  getMangaById: async (id: string) => {
    try {
      const response = await axios.get<MangaDexResponse<Manga>>(
        `${MANGADEX_API}/manga/${id}`,
        {
          params: {
            includes: ['cover_art', 'author', 'artist'],
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching manga details:', error);
      throw error;
    }
  },

  // Get manga chapters
  getMangaChapters: async (mangaId: string, limit: number = 100, offset: number = 0) => {
    try {
      const response = await axios.get(
        `${MANGADEX_API}/manga/${mangaId}/feed`,
        {
          params: {
            limit,
            offset,
            'translatedLanguage[]': ['en'],
            'order[chapter]': 'asc',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching manga chapters:', error);
      throw error;
    }
  },

  // Get cover image URL
  getCoverUrl: (mangaId: string, fileName: string, quality: 'original' | 'medium' | 'small' = 'medium') => {
    const size = quality === 'original' ? '' : `.512.jpg`;
    return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}${quality === 'original' ? '' : size}`;
  },
};

// Helper function to get current season
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 1 && month <= 3) return 'winter';
  if (month >= 4 && month <= 6) return 'spring';
  if (month >= 7 && month <= 9) return 'summer';
  return 'fall';
}

// Favorites management (localStorage)
export const favoritesApi = {
  getAnimeFavorites: (): number[] => {
    if (typeof window === 'undefined') return [];
    const favorites = localStorage.getItem('anime_favorites');
    return favorites ? JSON.parse(favorites) : [];
  },

  addAnimeFavorite: (animeId: number) => {
    if (typeof window === 'undefined') return;
    const favorites = favoritesApi.getAnimeFavorites();
    if (!favorites.includes(animeId)) {
      favorites.push(animeId);
      localStorage.setItem('anime_favorites', JSON.stringify(favorites));
    }
  },

  removeAnimeFavorite: (animeId: number) => {
    if (typeof window === 'undefined') return;
    const favorites = favoritesApi.getAnimeFavorites();
    const filtered = favorites.filter(id => id !== animeId);
    localStorage.setItem('anime_favorites', JSON.stringify(filtered));
  },

  isAnimeFavorite: (animeId: number): boolean => {
    return favoritesApi.getAnimeFavorites().includes(animeId);
  },

  getMangaFavorites: (): string[] => {
    if (typeof window === 'undefined') return [];
    const favorites = localStorage.getItem('manga_favorites');
    return favorites ? JSON.parse(favorites) : [];
  },

  addMangaFavorite: (mangaId: string) => {
    if (typeof window === 'undefined') return;
    const favorites = favoritesApi.getMangaFavorites();
    if (!favorites.includes(mangaId)) {
      favorites.push(mangaId);
      localStorage.setItem('manga_favorites', JSON.stringify(favorites));
    }
  },

  removeMangaFavorite: (mangaId: string) => {
    if (typeof window === 'undefined') return;
    const favorites = favoritesApi.getMangaFavorites();
    const filtered = favorites.filter(id => id !== mangaId);
    localStorage.setItem('manga_favorites', JSON.stringify(filtered));
  },

  isMangaFavorite: (mangaId: string): boolean => {
    return favoritesApi.getMangaFavorites().includes(mangaId);
  },
};
