// Serviço da API AniList (GraphQL, sem chave): https://docs.anilist.co
// Os dados são convertidos para o tipo `Anime` abaixo, que as telas já usam.
// Inclui fila (throttle), retry, timeout e cache.

const ENDPOINT = 'https://graphql.anilist.co';
const MIN_INTERVAL_MS = 700; // limite da API: ~90 req/min
const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;
const CACHE_MS = 5 * 60 * 1000;

export type Anime = {
  mal_id: number; 
  title: string;
  title_english: string | null;
  images: { jpg: { image_url: string; large_image_url: string } };
  score: number | null; // 0 a 10
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

type RawMedia = {
  id: number;
  title: { romaji: string | null; english: string | null };
  coverImage: { large: string | null; extraLarge: string | null };
  averageScore: number | null;
  rankings: { rank: number; type: string; allTime: boolean }[] | null;
  seasonYear: number | null;
  startDate: { year: number | null } | null;
  episodes: number | null;
  format: string | null;
  status: string | null;
  description: string | null;
  genres: string[] | null;
  studios: { nodes: { id: number; name: string }[] } | null;
  trailer: { id: string | null; site: string | null } | null;
  siteUrl: string;
};

const MEDIA_FIELDS = `
  id
  title { romaji english }
  coverImage { large extraLarge }
  averageScore
  rankings { rank type allTime }
  seasonYear
  startDate { year }
  episodes
  format
  status
  description(asHtml: false)
  genres
  studios(isMain: true) { nodes { id name } }
  trailer { id site }
  siteUrl
`;

const STATUS_PT: Record<string, string> = {
  FINISHED: 'Finalizado',
  RELEASING: 'Em exibição',
  NOT_YET_RELEASED: 'Em breve',
  CANCELLED: 'Cancelado',
  HIATUS: 'Em hiato',
};

function cleanDescription(text: string | null): string | null {
  if (!text) return null;
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

function trailerUrl(t: RawMedia['trailer']): string | null {
  if (!t?.id || !t.site) return null;
  if (t.site === 'youtube') return `https://www.youtube.com/watch?v=${t.id}`;
  if (t.site === 'dailymotion') return `https://www.dailymotion.com/video/${t.id}`;
  return null;
}

function toAnime(m: RawMedia): Anime {
  const cover = m.coverImage.extraLarge || m.coverImage.large || '';
  const ranked = m.rankings?.find((r) => r.type === 'RATED' && r.allTime);
  return {
    mal_id: m.id,
    title: m.title.romaji || m.title.english || 'Sem título',
    title_english: m.title.english,
    images: { jpg: { image_url: m.coverImage.large || cover, large_image_url: cover } },
    score: m.averageScore != null ? m.averageScore / 10 : null,
    rank: ranked ? ranked.rank : null,
    year: m.seasonYear ?? m.startDate?.year ?? null,
    episodes: m.episodes,
    type: m.format ? m.format.replace(/_/g, ' ') : null,
    status: m.status ? STATUS_PT[m.status] ?? m.status : null,
    synopsis: cleanDescription(m.description),
    genres: (m.genres ?? []).map((name, i) => ({ mal_id: i, name })),
    studios: (m.studios?.nodes ?? []).map((s) => ({ mal_id: s.id, name: s.name })),
    trailer: { url: trailerUrl(m.trailer) },
    url: m.siteUrl,
  };
}

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

const cache = new Map<string, { time: number; data: unknown }>();

async function gql<T>(
  query: string,
  variables: Record<string, unknown>,
  attempt = 0
): Promise<T> {
  const key = query + JSON.stringify(variables);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < CACHE_MS) {
    return cached.data as T;
  }

  await waitTurn();

  let res: Response;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (e) {
    clearTimeout(timer);
    console.log('[AniList] falha (tentativa', attempt + 1, ')', String(e));
    if (attempt < MAX_RETRIES) {
      await sleep(1000);
      return gql<T>(query, variables, attempt + 1);
    }
    throw new Error('Sem conexão. Verifique sua internet e tente de novo.');
  }

  if (res.status === 429 || res.status >= 500) {
    console.log('[AniList] status', res.status);
    if (attempt < MAX_RETRIES) {
      await sleep(1500 * (attempt + 1));
      return gql<T>(query, variables, attempt + 1);
    }
    throw new Error('A API está sobrecarregada. Tente novamente em instantes.');
  }

  const json = await res.json();
  if (!res.ok || json.errors) {
    console.log('[AniList] erro', res.status, JSON.stringify(json.errors));
    throw new Error(json.errors?.[0]?.message ?? `Erro ao buscar dados (código ${res.status}).`);
  }

  cache.set(key, { time: Date.now(), data: json.data });
  return json.data as T;
}

export async function getTopAnime(limit = 10): Promise<Anime[]> {
  const data = await gql<{ Page: { media: RawMedia[] } }>(
    `query ($perPage: Int) {
       Page(page: 1, perPage: $perPage) {
         media(type: ANIME, sort: SCORE_DESC, isAdult: false) { ${MEDIA_FIELDS} }
       }
     }`,
    { perPage: limit }
  );
  return data.Page.media.map(toAnime);
}

export async function getSeasonNow(limit = 10): Promise<Anime[]> {
  const data = await gql<{ Page: { media: RawMedia[] } }>(
    `query ($perPage: Int) {
       Page(page: 1, perPage: $perPage) {
         media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_FIELDS} }
       }
     }`,
    { perPage: limit }
  );
  return data.Page.media.map(toAnime);
}

export async function getAnimeById(id: number | string): Promise<Anime> {
  const data = await gql<{ Media: RawMedia }>(
    `query ($id: Int) {
       Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} }
     }`,
    { id: Number(id) }
  );
  return toAnime(data.Media);
}
