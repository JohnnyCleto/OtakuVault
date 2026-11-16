import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Kind, Titulo } from '../services/anilist';
import { useAuth } from './auth';

export type StatusKey = 'WATCHING' | 'COMPLETED' | 'DROPPED' | 'NOT_RECOMMENDED';

export const STATUS_ORDER: StatusKey[] = ['WATCHING', 'COMPLETED', 'DROPPED', 'NOT_RECOMMENDED'];

export const STATUS_COLOR: Record<StatusKey, string> = {
  WATCHING: '#4aa3ff',
  COMPLETED: '#4cc38a',
  DROPPED: '#ff6b6b',
  NOT_RECOMMENDED: '#f0a04b',
};

export const STATUS_SHORT: Record<StatusKey, string> = {
  WATCHING: 'Assistindo',
  COMPLETED: 'Completos',
  DROPPED: 'Dropados',
  NOT_RECOMMENDED: 'Não recomendo',
};

export function statusLabel(status: StatusKey, kind: Kind): string {
  switch (status) {
    case 'WATCHING':
      return kind === 'ANIME' ? 'Assistindo' : 'Lendo';
    case 'COMPLETED':
      return 'Completo';
    case 'DROPPED':
      return 'Dropado';
    case 'NOT_RECOMMENDED':
      return 'Não recomendo';
  }
}

// progress = último episódio (anime) ou capítulo (mangá) visto. Opcional para
// manter compatibilidade com listas salvas antes desse campo existir.
export type Entry = { titulo: Titulo; status: StatusKey; updatedAt: string; progress?: number };

type ListaValue = {
  entries: Entry[];
  getStatus: (id: number) => StatusKey | null;
  setStatus: (titulo: Titulo, status: StatusKey | null) => Promise<void>;
  getProgress: (id: number) => number;
  setProgress: (titulo: Titulo, progress: number) => Promise<void>;
  clear: () => Promise<void>;
};

const ListaContext = createContext<ListaValue | null>(null);

export function ListaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const key = `lista_v1:${user?.email ?? 'visitante'}`;
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        const list: Entry[] = raw ? JSON.parse(raw) : [];
        setEntries(list.filter((e) => e && e.titulo && typeof e.titulo.id === 'number'));
      } catch (e) {
        console.log('[Lista] falha ao ler', String(e));
        setEntries([]);
      }
    })();
  }, [key]);

  async function setStatus(titulo: Titulo, status: StatusKey | null) {
    const current = entries.find((e) => e.titulo.id === titulo.id);
    const others = entries.filter((e) => e.titulo.id !== titulo.id);
    const next = status
      ? [{ titulo, status, updatedAt: new Date().toISOString(), progress: current?.progress }, ...others]
      : others;
    await save(next);
  }

  async function setProgress(titulo: Titulo, progress: number) {
    const total = titulo.kind === 'ANIME' ? titulo.episodes : titulo.chapters;
    const value = Math.max(0, total ? Math.min(total, progress) : progress);
    const current = entries.find((e) => e.titulo.id === titulo.id);
    const others = entries.filter((e) => e.titulo.id !== titulo.id);
    const entry: Entry = {
      titulo,
      status: current?.status ?? 'WATCHING',
      updatedAt: new Date().toISOString(),
      progress: value,
    };
    await save([entry, ...others]);
  }

  async function save(next: Entry[]) {
    setEntries(next);
    await AsyncStorage.setItem(key, JSON.stringify(next));
  }

  async function clear() {
    setEntries([]);
    await AsyncStorage.removeItem(key);
  }

  const getStatus = (id: number) => entries.find((e) => e.titulo.id === id)?.status ?? null;
  const getProgress = (id: number) => entries.find((e) => e.titulo.id === id)?.progress ?? 0;

  return (
    <ListaContext.Provider value={{ entries, getStatus, setStatus, getProgress, setProgress, clear }}>
      {children}
    </ListaContext.Provider>
  );
}

export function useLista() {
  const ctx = useContext(ListaContext);
  if (!ctx) throw new Error('useLista precisa estar dentro de <ListaProvider>.');
  return ctx;
}
