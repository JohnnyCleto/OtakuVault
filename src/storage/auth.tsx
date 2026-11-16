import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

type StoredUser = {
  name: string;
  email: string;
  passwordHash: string;
  createdAt?: string;
  bio?: string;
  avatar?: string;
};
// avatar = URL da imagem de um personagem escolhido pelo usuário.
export type User = { name: string; email: string; createdAt?: string; bio?: string; avatar?: string };

type AuthValue = {
  user: User | null;
  ready: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, bio: string) => Promise<void>;
  updateAvatar: (avatar: string | null) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const USERS_KEY = 'users';
const SESSION_KEY = 'session';

const AuthContext = createContext<AuthValue | null>(null);

async function readUsers(): Promise<Record<string, StoredUser>> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : {};
}

const publicUser = (u: StoredUser): User => ({
  name: u.name,
  email: u.email,
  createdAt: u.createdAt,
  bio: u.bio,
  avatar: u.avatar,
});

function hashPassword(email: string, password: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${email}:${password}`);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const email = await AsyncStorage.getItem(SESSION_KEY);
        if (email) {
          const stored = (await readUsers())[email];
          if (stored) setUser(publicUser(stored));
        }
      } catch (e) {
        console.log('[Auth] falha ao restaurar sessão', String(e));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  async function register(name: string, emailRaw: string, password: string) {
    const email = emailRaw.trim().toLowerCase();
    if (!name.trim()) throw new Error('Informe seu nome.');
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('E-mail inválido.');
    if (password.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');

    const users = await readUsers();
    if (users[email]) throw new Error('Este e-mail já está cadastrado.');

    const stored: StoredUser = {
      name: name.trim(),
      email,
      passwordHash: await hashPassword(email, password),
      createdAt: new Date().toISOString(),
      bio: '',
    };
    users[email] = stored;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    await AsyncStorage.setItem(SESSION_KEY, email);
    setUser(publicUser(stored));
  }

  async function login(emailRaw: string, password: string) {
    const email = emailRaw.trim().toLowerCase();
    const stored = (await readUsers())[email];
    if (!stored || stored.passwordHash !== (await hashPassword(email, password))) {
      throw new Error('E-mail ou senha incorretos.');
    }
    await AsyncStorage.setItem(SESSION_KEY, email);
    setUser(publicUser(stored));
  }

  async function logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  async function updateProfile(name: string, bio: string) {
    if (!user) throw new Error('Você precisa estar logado.');
    if (!name.trim()) throw new Error('O nome não pode ficar vazio.');
    const users = await readUsers();
    const stored = users[user.email];
    if (!stored) throw new Error('Conta não encontrada.');
    stored.name = name.trim();
    stored.bio = bio.trim().slice(0, 160);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    setUser(publicUser(stored));
  }

  async function updateAvatar(avatar: string | null) {
    if (!user) throw new Error('Você precisa estar logado.');
    const users = await readUsers();
    const stored = users[user.email];
    if (!stored) throw new Error('Conta não encontrada.');
    if (avatar) stored.avatar = avatar;
    else delete stored.avatar;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    setUser(publicUser(stored));
  }

  async function changePassword(current: string, next: string) {
    if (!user) throw new Error('Você precisa estar logado.');
    if (next.length < 6) throw new Error('A nova senha precisa ter pelo menos 6 caracteres.');
    const users = await readUsers();
    const stored = users[user.email];
    if (!stored || stored.passwordHash !== (await hashPassword(user.email, current))) {
      throw new Error('Senha atual incorreta.');
    }
    stored.passwordHash = await hashPassword(user.email, next);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  async function deleteAccount() {
    if (!user) return;
    const users = await readUsers();
    delete users[user.email];
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    await AsyncStorage.multiRemove([
      SESSION_KEY,
      `favorites_v2:${user.email}`,
      `lista_v1:${user.email}`,
    ]);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, ready, register, login, logout, updateProfile, updateAvatar, changePassword, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
