import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type Genre = { value: string; label: string; color: string; icon: IconName };

export const GENRES: Genre[] = [
  { value: 'Adventure', label: 'Aventura', color: '#3d6fa8', icon: 'compass' },
  { value: 'Action', label: 'Ação', color: '#2f5a7a', icon: 'film' },
  { value: 'Comedy', label: 'Comédia', color: '#b03a12', icon: 'happy' },
  { value: 'Drama', label: 'Drama', color: '#26304f', icon: 'rainy' },
  { value: 'Fantasy', label: 'Fantasia', color: '#d9701a', icon: 'star' },
  { value: 'Romance', label: 'Romance', color: '#b0527a', icon: 'heart' },
  { value: 'Slice of Life', label: 'Slice of Life', color: '#c4607f', icon: 'cafe' },
  { value: 'Supernatural', label: 'Sobrenatural', color: '#6c63a8', icon: 'flame' },
  { value: 'Sci-Fi', label: 'Sci-Fi', color: '#5f7a72', icon: 'planet' },
  { value: 'Mystery', label: 'Mistério', color: '#4a3a5c', icon: 'search' },
  { value: 'Sports', label: 'Esportes', color: '#2f7d4f', icon: 'football' },
  { value: 'Horror', label: 'Terror', color: '#5c1f2b', icon: 'skull' },
];

// Gêneros que aparecem direto na barra da página inicial.
export const QUICK_GENRES = ['Action', 'Romance', 'Fantasy'];

export const genreLabel = (value: string) => GENRES.find((g) => g.value === value)?.label ?? value;
