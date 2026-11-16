import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ErrorView, Loading } from '../../components/StateViews';
import TituloRow from '../../components/TituloRow';
import { genreLabel } from '../../genres';
import { Kind, searchMedia, SearchParams, Titulo } from '../../services/anilist';
import { colors } from '../../theme';

// Cada seção da página inicial vira uma busca paginada.
const SECOES: Record<string, { title: string; params: SearchParams }> = {
  'em-alta': { title: 'Em alta', params: { sort: ['TRENDING_DESC'] } },
  recentes: { title: 'Recém adicionados', params: { sort: ['ID_DESC'], popularityGreater: 500 } },
  melhores: { title: 'Mais bem avaliados', params: { sort: ['SCORE_DESC'], popularityGreater: 10000 } },
};

export default function SecaoScreen() {
  const { tipo, genero, kind } = useLocalSearchParams<{ tipo: string; genero?: string; kind?: string }>();
  const secao = SECOES[tipo] ?? SECOES['em-alta'];
  const type: Kind = kind === 'MANGA' ? 'MANGA' : 'ANIME';
  const genre = genero || undefined;

  const [items, setItems] = useState<Titulo[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (p: number) => {
      const res = await searchMedia({ ...secao.params, type, genre, perPage: 25, page: p });
      setItems((prev) => {
        if (p === 1) return res.items;
        const ids = new Set(prev.map((i) => i.id));
        return [...prev, ...res.items.filter((i) => !ids.has(i.id))];
      });
      setHasNext(res.hasNext);
      setPage(p);
    },
    [secao, type, genre]
  );

  const loadFirst = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await load(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      await load(page + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setLoadingMore(false);
    }
  }

  const title = genre ? `${secao.title} · ${genreLabel(genre)}` : secao.title;

  if (loading) return <Loading />;
  if (error && items.length === 0) return <ErrorView message={error} onRetry={loadFirst} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title }} />
      <FlatList
        data={items}
        keyExtractor={(t) => String(t.id)}
        renderItem={({ item }) => <TituloRow titulo={item} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum título encontrado.</Text>}
        ListFooterComponent={
          hasNext ? (
            <Pressable style={styles.more} onPress={loadMore} disabled={loadingMore}>
              {loadingMore ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.moreText}>Carregar mais</Text>
              )}
            </Pressable>
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  more: { backgroundColor: colors.accent, margin: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  moreText: { color: colors.bg, fontWeight: '800' },
});
