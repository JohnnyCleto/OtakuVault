const ENDPOINT = 'https://graphql.anilist.co';
const MIN_INTERVAL_MS = 700; 
const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;
const CACHE_MS = 5 * 60 * 1000;

export type Kind = 'ANIME' | 'MANGA';

export type Titulo = {
  id: number;
  kind: Kind;
  title: string;
  titleEnglish: string | null;
  cover: string;
  coverLarge: string;
  banner: string | null;
  score: number | null; 
  rank: number | null;
  year: number | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  chapters: number | null;
  volumes: number | null;
  synopsis: string | null;
  genres: string[];
  studios: string[];
  authors: string[];
  trailerUrl: string | null;
  url: string;
};

export const nomeExibicao = (t: Titulo) => t.titleEnglish || t.title;
export const kindLabel = (k: Kind) => (k === 'ANIME' ? 'Anime' : 'Mangá');

type RawMedia = {
  id: number;
  type: Kind;
  isAdult: boolean | null;
  popularity: number | null;
  title: { romaji: string | null; english: string | null };
  coverImage: { large: string | null; extraLarge: string | null };
  bannerImage: string | null;
  averageScore: number | null;
  seasonYear: number | null;
  startDate: { year: number | null } | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  chapters: number | null;
  volumes: number | null;
  siteUrl: string;
  description?: string | null;
  genres?: string[] | null;
  studios?: { nodes: { name: string }[] } | null;
  staff?: { nodes: { name: { full: string } }[] } | null;
  rankings?: { rank: number; type: string; allTime: boolean }[] | null;
  trailer?: { id: string | null; site: string | null } | null;
};

const LIST_FIELDS = `
  id type isAdult popularity
  title { romaji english }
  coverImage { large extraLarge }
  bannerImage
  averageScore
  seasonYear
  startDate { year }
  format status episodes chapters volumes
  genres
  siteUrl
`;

const DETAIL_FIELDS = `
  ${LIST_FIELDS}
  description(asHtml: false)
  genres
  studios(isMain: true) { nodes { name } }
  staff(perPage: 3, sort: RELEVANCE) { nodes { name { full } } }
  rankings { rank type allTime }
  trailer { id site }
`;

const STATUS_PT: Record<string, string> = {
  FINISHED: 'Finalizado',
  RELEASING: 'Em lançamento',
  NOT_YET_RELEASED: 'Em breve',
  CANCELLED: 'Cancelado',
  HIATUS: 'Em hiato',
};

const FORMAT_PT: Record<string, string> = {
  TV: 'TV',
  TV_SHORT: 'TV curto',
  MOVIE: 'Filme',
  SPECIAL: 'Especial',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Música',
  MANGA: 'Mangá',
  NOVEL: 'Novel',
  ONE_SHOT: 'One-shot',
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

function toTitulo(m: RawMedia): Titulo {
  const large = m.coverImage.large || m.coverImage.extraLarge || '';
  const xl = m.coverImage.extraLarge || large;
  const ranked = m.rankings?.find((r) => r.type === 'RATED' && r.allTime);
  return {
    id: m.id,
    kind: m.type,
    title: m.title.romaji || m.title.english || 'Sem título',
    titleEnglish: m.title.english,
    cover: large,
    coverLarge: xl,
    banner: m.bannerImage,
    score: m.averageScore != null ? m.averageScore / 10 : null,
    rank: ranked ? ranked.rank : null,
    year: m.seasonYear ?? m.startDate?.year ?? null,
    format: m.format ? FORMAT_PT[m.format] ?? m.format.replace(/_/g, ' ') : null,
    status: m.status ? STATUS_PT[m.status] ?? m.status : null,
    episodes: m.episodes,
    chapters: m.chapters,
    volumes: m.volumes,
    synopsis: cleanDescription(m.description ?? null),
    genres: m.genres ?? [],
    studios: (m.studios?.nodes ?? []).map((s) => s.name),
    authors: (m.staff?.nodes ?? []).map((s) => s.name.full),
    trailerUrl: trailerUrl(m.trailer ?? null),
    url: m.siteUrl,
  };
}

function uniqueById<T extends { id: number }>(list: T[]): T[] {
  const seen = new Set<number>();
  return list.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
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

export type SearchParams = {
  type?: Kind;
  sort?: string[]; 
  status?: string; 
  genre?: string;
  search?: string;
  page?: number;
  perPage?: number;
  popularityGreater?: number;
};

export async function searchMedia(
  p: SearchParams = {}
): Promise<{ items: Titulo[]; hasNext: boolean }> {
  const data = await gql<{
    Page: { pageInfo: { hasNextPage: boolean }; media: RawMedia[] };
  }>(
    `query ($page: Int, $perPage: Int, $type: MediaType, $sort: [MediaSort],
            $status: MediaStatus, $genre: String, $search: String, $pop: Int) {
       Page(page: $page, perPage: $perPage) {
         pageInfo { hasNextPage }
         media(type: $type, sort: $sort, status: $status, genre: $genre,
               search: $search, popularity_greater: $pop, isAdult: false) {
           ${LIST_FIELDS}
         }
       }
     }`,
    {
      page: p.page ?? 1,
      perPage: p.perPage ?? 20,
      type: p.type,
      sort: p.sort,
      status: p.status,
      genre: p.genre,
      search: p.search,
      pop: p.popularityGreater,
    }
  );
  return {
    items: uniqueById(data.Page.media.map(toTitulo)),
    hasNext: data.Page.pageInfo.hasNextPage,
  };
}

// O parâmetro genre é opcional: sem ele, a lista inclui todos os gêneros.
export const getTrending = async (type: Kind, perPage = 12, genre?: string) =>
  (await searchMedia({ type, genre, sort: ['TRENDING_DESC'], perPage })).items;

export const getTopRated = async (type: Kind, perPage = 12, genre?: string) =>
  (await searchMedia({ type, genre, sort: ['SCORE_DESC'], popularityGreater: 10000, perPage })).items;

export const getPopular = async (type: Kind, perPage = 12) =>
  (await searchMedia({ type, sort: ['POPULARITY_DESC'], perPage })).items;

export const getRecentlyAdded = async (type: Kind, perPage = 12, genre?: string) =>
  (await searchMedia({ type, genre, sort: ['ID_DESC'], popularityGreater: 500, perPage })).items;

export const getRecentlyUpdated = async (type: Kind, perPage = 12) =>
  (
    await searchMedia({
      type,
      sort: ['UPDATED_AT_DESC'],
      status: 'RELEASING',
      popularityGreater: 2000,
      perPage,
    })
  ).items;

export async function getNewEpisodes(limit = 12): Promise<{ titulo: Titulo; episode: number }[]> {
  const hour = Math.floor(Date.now() / 3600000) * 3600;
  const data = await gql<{
    Page: { airingSchedules: { episode: number; media: RawMedia }[] };
  }>(
    `query ($from: Int, $to: Int) {
       Page(page: 1, perPage: 50) {
         airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME_DESC) {
           episode
           media { ${LIST_FIELDS} }
         }
       }
     }`,
    { from: hour - 3 * 24 * 3600, to: hour }
  );
  const items = data.Page.airingSchedules
    .filter((s) => s.media && !s.media.isAdult)
    .sort((a, b) => (b.media.popularity ?? 0) - (a.media.popularity ?? 0));
  return uniqueById(items.map((s) => ({ id: s.media.id, titulo: toTitulo(s.media), episode: s.episode })))
    .slice(0, limit)
    .map(({ titulo, episode }) => ({ titulo, episode }));
}

export async function getGenreCovers(genres: string[], type: Kind): Promise<Record<string, string>> {
  try {
    const body = genres
      .map(
        (g, i) =>
          `g${i}: Page(perPage: 1) { media(genre: ${JSON.stringify(g)}, type: ${type}, sort: POPULARITY_DESC, isAdult: false) { coverImage { large } } }`
      )
      .join('\n');
    const data = await gql<Record<string, { media: { coverImage: { large: string | null } }[] }>>(
      `query { ${body} }`,
      {}
    );
    const out: Record<string, string> = {};
    genres.forEach((g, i) => {
      const url = data[`g${i}`]?.media?.[0]?.coverImage?.large;
      if (url) out[g] = url;
    });
    return out;
  } catch (e) {
    console.log('[AniList] capas dos gêneros indisponíveis', String(e));
    return {};
  }
}

export async function getTitulo(id: number | string): Promise<Titulo> {
  const data = await gql<{ Media: RawMedia }>(
    `query ($id: Int) { Media(id: $id) { ${DETAIL_FIELDS} } }`,
    { id: Number(id) }
  );
  return toTitulo(data.Media);
}

export type Personagem = {
  id: number;
  name: string;
  nameNative: string | null;
  image: string;
  role: 'MAIN' | 'SUPPORTING' | 'BACKGROUND' | string;
  voiceActor: string | null; 
};

export const ROLE_PT: Record<string, string> = {
  MAIN: 'Principal',
  SUPPORTING: 'Coadjuvante',
  BACKGROUND: 'Figurante',
};

export async function getPersonagens(id: number | string, perPage = 30): Promise<Personagem[]> {
  const data = await gql<{
    Media: {
      characters: {
        edges: {
          role: string;
          node: {
            id: number;
            name: { full: string | null; native: string | null };
            image: { large: string | null };
          };
          voiceActors: { name: { full: string | null } }[] | null;
        }[];
      } | null;
    };
  }>(
    `query ($id: Int, $perPage: Int) {
       Media(id: $id) {
         characters(perPage: $perPage, sort: [ROLE, RELEVANCE, ID]) {
           edges {
             role
             node { id name { full native } image { large } }
             voiceActors(language: JAPANESE) { name { full } }
           }
         }
       }
     }`,
    { id: Number(id), perPage }
  );

  const edges = data.Media.characters?.edges ?? [];
  return uniqueById(
    edges.map((e) => ({
      id: e.node.id,
      name: e.node.name.full ?? 'Sem nome',
      nameNative: e.node.name.native,
      image: e.node.image.large ?? '',
      role: e.role,
      voiceActor: e.voiceActors?.[0]?.name.full ?? null,
    }))
  );
}

export function clearCache() {
  cache.clear();
}
