import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import TituloRow from '../../components/TituloRow';
import { ErrorView, Loading } from '../../components/StateViews';
import { Kind, searchMedia, Titulo } from '../../services/anilist';
import { colors } from '../../theme';

export default function CategoriaScreen() {
  const { nome, label, tipo } = useLocalSearchParams<{ nome: string; label?: string; tipo?: string }>();
  const type: Kind | undefined = tipo === 'ANIME' || tipo === 'MANGA' ? tipo : undefined;

  const [items, setItems] = useState<Titulo[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFirst = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchMedia({ genre: nome, type, sort: ['POPULARITY_DESC'], perPage: 25, page: 1 });
      setItems(res.items);
      setHasNext(res.hasNext);
      setPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }, [nome, type]);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await searchMedia({ genre: nome, type, sort: ['POPULARITY_DESC'], perPage: 25, page: page + 1 });
      setItems((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...res.items.filter((i) => !ids.has(i.id))];
      });
      setHasNext(res.hasNext);
      setPage(page + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) return <Loading />;
  if (error && items.length === 0) return <ErrorView message={error} onRetry={loadFirst} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title: label ?? nome }} />
      <FlatList
        data={items}
        keyExtractor={(t) => String(t.id)}
        renderItem={({ item }) => <TituloRow titulo={item} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum título encontrado nesta categoria.</Text>}
        ListFooterComponent={
          hasNext ? (
            <Pressable style={styles.more} onPress={loadMore} disabled={loadingMore}>
              {loadingMore ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.moreText}>Carregar mais</Text>
              )}
            </Pressable>
          ) : null
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
