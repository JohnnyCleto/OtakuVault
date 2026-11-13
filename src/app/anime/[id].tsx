import { useCallback, useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ErrorView, Loading } from '../../components/StateViews';
import { Anime, getAnimeById } from '../../services/anilist';
import { colors } from '../../theme';

export default function AnimeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAnime(await getAnimeById(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading />;
  if (error || !anime) return <ErrorView message={error ?? 'Anime não encontrado.'} onRetry={load} />;

  const title = anime.title_english || anime.title;
  const trailerUrl = anime.trailer?.url;
  const meta = [
    anime.type,
    anime.year ? String(anime.year) : null,
    anime.episodes ? `${anime.episodes} episódios` : null,
    anime.status,
  ].filter(Boolean);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title }} />

      <Image
        source={{ uri: anime.images.jpg.large_image_url }}
        style={styles.poster}
        resizeMode="cover"
      />

      <Text style={styles.title}>{title}</Text>
      {anime.title_english && anime.title !== anime.title_english && (
        <Text style={styles.original}>{anime.title}</Text>
      )}

      <View style={styles.row}>
        {anime.score != null && (
          <View style={styles.scoreBox}>
            <Ionicons name="star" size={16} color={colors.score} />
            <Text style={styles.scoreText}>{anime.score.toFixed(2)}</Text>
          </View>
        )}
        {anime.rank != null && <Text style={styles.meta}>Posição #{anime.rank}</Text>}
      </View>

      {meta.length > 0 && <Text style={styles.meta}>{meta.join(' | ')}</Text>}

      {anime.genres.length > 0 && (
        <View style={styles.chips}>
          {anime.genres.map((g) => (
            <View key={g.mal_id} style={styles.chip}>
              <Text style={styles.chipText}>{g.name}</Text>
            </View>
          ))}
        </View>
      )}

      {anime.studios.length > 0 && (
        <Text style={styles.meta}>Estúdio: {anime.studios.map((s) => s.name).join(', ')}</Text>
      )}

      <Text style={styles.heading}>Sinopse</Text>
      <Text style={styles.synopsis}>
        {anime.synopsis || 'Este anime ainda não tem sinopse.'}
      </Text>

      {trailerUrl && (
        <Pressable style={styles.button} onPress={() => Linking.openURL(trailerUrl)}>
          <Ionicons name="play" size={18} color={colors.bg} />
          <Text style={styles.buttonText}>Assistir trailer</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  poster: { width: '100%', height: 420, borderRadius: 12, backgroundColor: colors.surface },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 6 },
  original: { color: colors.textMuted, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreText: { color: colors.text, fontWeight: '800', fontSize: 16 },
  meta: { color: colors.textMuted, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  heading: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 8 },
  synopsis: { color: colors.text, fontSize: 15, lineHeight: 23 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  buttonText: { color: colors.bg, fontWeight: '800', fontSize: 15 },
});
