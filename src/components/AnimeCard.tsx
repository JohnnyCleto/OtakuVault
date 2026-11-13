import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import type { Anime } from '../services/anilist';

type Props = {
  anime: Anime;
  width?: number;
};

export default function AnimeCard({ anime, width = 140 }: Props) {
  const height = width * 1.45;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
      onPress={() =>
        router.push({ pathname: '/anime/[id]', params: { id: String(anime.mal_id) } })
      }
    >
      <Image
        source={{ uri: anime.images.jpg.large_image_url || anime.images.jpg.image_url }}
        style={{ width, height }}
        resizeMode="cover"
      />
      {anime.score != null && (
        <View style={styles.badge}>
          <Ionicons name="star" size={11} color={colors.score} />
          <Text style={styles.badgeText}>{anime.score.toFixed(1)}</Text>
        </View>
      )}
      <Text style={styles.title} numberOfLines={2}>
        {anime.title_english || anime.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(21,19,31,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    padding: 8,
    minHeight: 48,
  },
});
