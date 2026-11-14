import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsValue = {
  autoplay: boolean; 
  setAutoplay: (value: boolean) => void;
};

const KEY = 'settings_v1';
const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [autoplay, setAutoplayState] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (typeof saved.autoplay === 'boolean') setAutoplayState(saved.autoplay);
        }
      } catch (e) {
        console.log('[Config] falha ao ler', String(e));
      }
    })();
  }, []);

  function setAutoplay(value: boolean) {
    setAutoplayState(value);
    AsyncStorage.setItem(KEY, JSON.stringify({ autoplay: value })).catch((e) =>
      console.log('[Config] falha ao salvar', String(e))
    );
  }

  return (
    <SettingsContext.Provider value={{ autoplay, setAutoplay }}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings precisa estar dentro de <SettingsProvider>.');
  return ctx;
}
