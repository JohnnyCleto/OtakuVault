import { useCallback, useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import AnimeCard from '../../components/AnimeCard';
import { ErrorView, Loading } from '../../components/StateViews';
import { Anime, getSeasonNow, getTopAnime } from '../../services/anilist';
import { colors } from '../../theme';

function Section({ title, data }: { title: string; data: Anime[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.mal_id)}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={({ item }) => <AnimeCard anime={item} />}
      />
    </View>
  );
}

export default function HomeScreen() {
  const [top, setTop] = useState<Anime[]>([]);
  const [airing, setAiring] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const topData = await getTopAnime(10);
      const airingData = await getSeasonNow(10);
      setTop(topData);
      setAiring(airingData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingVertical: 16 }}>
      <Section title="Mais bem avaliados" data={top} />
      <Section title="No ar nesta temporada" data={airing} />
      <Text style={styles.credit}>Dados por AniList</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  section: { marginBottom: 24 },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  list: { paddingHorizontal: 16 },
  credit: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 },
});
