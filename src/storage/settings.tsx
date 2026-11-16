import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Preferências do app, salvas no aparelho.
export type Settings = {
  autoplay: boolean; // troca automática do carrossel "Em alta"
  novidadesDot: boolean; // bolinha rosa no sininho quando há episódio novo
  salvarHistorico: boolean; // registrar os títulos abertos no histórico
};

const DEFAULTS: Settings = { autoplay: true, novidadesDot: true, salvarHistorico: true };

type SettingsValue = Settings & {
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  setAutoplay: (value: boolean) => void;
};

const KEY = 'settings_v1';
const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          const next = { ...DEFAULTS };
          (Object.keys(DEFAULTS) as (keyof Settings)[]).forEach((k) => {
            if (typeof saved[k] === 'boolean') next[k] = saved[k];
          });
          setSettings(next);
        }
      } catch (e) {
        console.log('[Config] falha ao ler', String(e));
      }
    })();
  }, []);

  function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch((e) =>
        console.log('[Config] falha ao salvar', String(e))
      );
      return next;
    });
  }

  const setAutoplay = (value: boolean) => setSetting('autoplay', value);

  return (
    <SettingsContext.Provider value={{ ...settings, setSetting, setAutoplay }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings precisa estar dentro de <SettingsProvider>.');
  return ctx;
}
