// Serviço da API Jikan (https://docs.api.jikan.moe) com fila, retry e cache.
// Limite da API: 3 req/s e 60 req/min. A fila abaixo espaça as chamadas.

const BASE_URL = 'https://api.jikan.moe/v4';
const MIN_INTERVAL_MS = 400; // ~2,5 req/s, abaixo do limite
const MAX_RETRIES = 2;
const CACHE_MS = 5 * 60 * 1000; // 5 minutos

export type Anime = {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: { jpg: { image_url: string; large_image_url: string } };
  score: number | null;
  rank: number | null;
  year: number | null;
  episodes: number | null;
  type: string | null;
  status: string | null;
  synopsis: string | null;
  genres: { mal_id: number; name: string }[];
  studios: { mal_id: number; name: string }[];
  trailer?: { url: string | null };
  url: string;
};

type ListResponse = { data: Anime[] };
type ItemResponse = { data: Anime };

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

let lastStart = 0;
let queue: Promise<void> = Promise.resolve();

function waitTurn(): Promise<void> {
  const turn = queue.then(async () => {
    const wait = Math.max(0, lastStart + MIN_INTERVAL_MS - Date.now());
    if (wait > 0) await sleep(wait);
    lastStart = Date.now();
  });
  queue = turn;
  return turn;
}

const cache = new Map<string, { time: number; json: unknown }>();

async function apiGet<T>(path: string, attempt = 0): Promise<T> {
  const cached = cache.get(path);
  if (cached && Date.now() - cached.time < CACHE_MS) {
    return cached.json as T;
  }

  await waitTurn();

  let res: Response;
  try {
    res = await fetch(BASE_URL + path);
  } catch {
    if (attempt < MAX_RETRIES) {
      await sleep(1000);
      return apiGet<T>(path, attempt + 1);
    }
    throw new Error('Sem conexão. Verifique sua internet e tente de novo.');
  }

  if (res.status === 429 || res.status >= 500) {
    if (attempt < MAX_RETRIES) {
      await sleep(1000 * (attempt + 1));
      return apiGet<T>(path, attempt + 1);
    }
    throw new Error('A API está sobrecarregada. Tente novamente em instantes.');
  }

  if (!res.ok) {
    throw new Error(`Erro ao buscar dados (código ${res.status}).`);
  }

  const json = await res.json();
  cache.set(path, { time: Date.now(), json });
  return json as T;
}

function uniqueById(list: Anime[]): Anime[] {
  const seen = new Set<number>();
  return list.filter((a) => (seen.has(a.mal_id) ? false : (seen.add(a.mal_id), true)));
}

export async function getTopAnime(limit = 10): Promise<Anime[]> {
  const res = await apiGet<ListResponse>(`/top/anime?limit=${limit}`);
  return uniqueById(res.data);
}

export async function getSeasonNow(limit = 10): Promise<Anime[]> {
  const res = await apiGet<ListResponse>(`/seasons/now?limit=${limit}`);
  return uniqueById(res.data);
}

export async function getAnimeById(id: number | string): Promise<Anime> {
  const res = await apiGet<ItemResponse>(`/anime/${id}/full`);
  return res.data;
}
