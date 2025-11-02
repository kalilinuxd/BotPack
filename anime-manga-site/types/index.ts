// Anime Types
export interface Anime {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  type?: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      large_image_url: string;
    };
  };
  synopsis?: string;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  episodes?: number;
  status?: string;
  airing?: boolean;
  aired?: {
    from?: string;
    to?: string;
    string?: string;
  };
  duration?: string;
  rating?: string;
  season?: string;
  year?: number;
  studios?: Array<{ mal_id: number; name: string }>;
  genres?: Array<{ mal_id: number; name: string }>;
  themes?: Array<{ mal_id: number; name: string }>;
  demographics?: Array<{ mal_id: number; name: string }>;
  trailer?: {
    youtube_id?: string;
    url?: string;
    embed_url?: string;
  };
}

export interface AnimeEpisode {
  mal_id: number;
  title: string;
  episode: string;
  url: string;
  aired?: string;
}

// Manga Types
export interface Manga {
  id: string;
  type: string;
  attributes: {
    title: {
      en?: string;
      ja?: string;
      [key: string]: string | undefined;
    };
    altTitles?: Array<{ [key: string]: string }>;
    description?: {
      en?: string;
      [key: string]: string | undefined;
    };
    status?: string;
    year?: number;
    contentRating?: string;
    tags?: Array<{
      id: string;
      attributes: {
        name: {
          en: string;
        };
      };
    }>;
    createdAt?: string;
    updatedAt?: string;
  };
  relationships?: Array<{
    id: string;
    type: string;
    attributes?: any;
  }>;
}

export interface MangaChapter {
  id: string;
  type: string;
  attributes: {
    volume?: string;
    chapter?: string;
    title?: string;
    translatedLanguage: string;
    publishAt: string;
    pages: number;
  };
}

// API Response Types
export interface JikanResponse<T> {
  data: T;
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

export interface MangaDexResponse<T> {
  result: string;
  response: string;
  data: T;
  limit?: number;
  offset?: number;
  total?: number;
}

// Search and Filter Types
export interface SearchParams {
  q?: string;
  type?: string;
  status?: string;
  rating?: string;
  genre?: string;
  order_by?: string;
  sort?: string;
  page?: number;
  limit?: number;
}
