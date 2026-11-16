import { useAsync } from './useAsync';
import { getNewEpisodes } from '../services/anilist';
import { useFavorites } from '../storage/favorites';
import { useLista } from '../storage/lista';

// Novos episódios dos últimos 3 dias, separando os que o usuário acompanha
// (estão nos favoritos ou na lista) dos demais.
export function useNovidades() {
  const state = useAsync(() => getNewEpisodes(40), []);
  const { favorites } = useFavorites();
  const { entries } = useLista();

  const seguidos = new Set<number>([
    ...favorites.map((f) => f.id),
    ...entries.map((e) => e.titulo.id),
  ]);

  const todos = state.data ?? [];
  const meus = todos.filter((e) => seguidos.has(e.titulo.id));
  const outros = todos.filter((e) => !seguidos.has(e.titulo.id));

  return { state, meus, outros };
}
