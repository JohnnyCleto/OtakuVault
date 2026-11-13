import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Titulo } from '../services/anilist';
import { useAuth } from './auth';


type FavoritesValue = {
  favorites: Titulo[];
  isFavorite: (id: number) => boolean;
  toggle: (titulo: Titulo) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const key = `favorites_v2:${user?.email ?? 'visitante'}`;
  const [favorites, setFavorites] = useState<Titulo[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        const list: Titulo[] = raw ? JSON.parse(raw) : [];
        setFavorites(list.filter((t) => t && typeof t.id === 'number'));
      } catch (e) {
        console.log('[Favoritos] falha ao ler', String(e));
        setFavorites([]);
      }
    })();
  }, [key]);

  async function toggle(titulo: Titulo) {
    const exists = favorites.some((f) => f.id === titulo.id);
    const next = exists ? favorites.filter((f) => f.id !== titulo.id) : [titulo, ...favorites];
    setFavorites(next);
    await AsyncStorage.setItem(key, JSON.stringify(next));
  }

  const isFavorite = (id: number) => favorites.some((f) => f.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites precisa estar dentro de <FavoritesProvider>.');
  return ctx;
}
