import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Titulo } from '../services/anilist';
import { useAuth } from './auth';

// Guarda os últimos títulos abertos na tela de detalhes, por usuário.
const LIMITE = 50;

export type Visita = { titulo: Titulo; viewedAt: string };

type HistoricoValue = {
  visitas: Visita[];
  registrar: (titulo: Titulo) => Promise<void>;
  remover: (id: number) => Promise<void>;
  clear: () => Promise<void>;
};

const HistoricoContext = createContext<HistoricoValue | null>(null);

export function HistoricoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const key = `historico_v1:${user?.email ?? 'visitante'}`;
  const [visitas, setVisitas] = useState<Visita[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        const list: Visita[] = raw ? JSON.parse(raw) : [];
        setVisitas(list.filter((v) => v && v.titulo && typeof v.titulo.id === 'number'));
      } catch (e) {
        console.log('[Histórico] falha ao ler', String(e));
        setVisitas([]);
      }
    })();
  }, [key]);

  async function save(next: Visita[]) {
    setVisitas(next);
    await AsyncStorage.setItem(key, JSON.stringify(next));
  }

  async function registrar(titulo: Titulo) {
    const others = visitas.filter((v) => v.titulo.id !== titulo.id);
    await save([{ titulo, viewedAt: new Date().toISOString() }, ...others].slice(0, LIMITE));
  }

  async function remover(id: number) {
    await save(visitas.filter((v) => v.titulo.id !== id));
  }

  async function clear() {
    setVisitas([]);
    await AsyncStorage.removeItem(key);
  }

  return (
    <HistoricoContext.Provider value={{ visitas, registrar, remover, clear }}>
      {children}
    </HistoricoContext.Provider>
  );
}

export function useHistorico() {
  const ctx = useContext(HistoricoContext);
  if (!ctx) throw new Error('useHistorico precisa estar dentro de <HistoricoProvider>.');
  return ctx;
}
