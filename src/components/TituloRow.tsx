import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { openTitulo } from '../navigation';
import { kindLabel, nomeExibicao, Titulo } from '../services/anilist';
import { colors } from '../theme';

export default function TituloRow({
  titulo,
  onRemove,
}: {
  titulo: Titulo;
  onRemove?: () => void;
}) {
  const info = [titulo.year, titulo.format].filter(Boolean).join(' | ');

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      onPress={() => openTitulo(titulo.id)}
    >
      <Image source={{ uri: titulo.cover }} style={styles.cover} resizeMode="cover" />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={3}>
          {nomeExibicao(titulo)}
        </Text>
        {info !== '' && <Text style={styles.meta}>{info}</Text>}
        {titulo.score != null && (
          <View style={styles.score}>
            <Ionicons name="star" size={13} color={colors.score} />
            <Text style={styles.meta}>{titulo.score.toFixed(1)}</Text>
          </View>
        )}
        <View style={styles.tag}>
          <Text style={styles.tagText}>{kindLabel(titulo.kind)}</Text>
        </View>
      </View>

      {onRemove && (
        <Pressable hitSlop={10} onPress={onRemove}>
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cover: { width: 84, height: 120, borderRadius: 8, backgroundColor: colors.surface },
  info: { flex: 1, gap: 4 },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.textMuted, fontSize: 14 },
  score: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 2,
  },
  tagText: { color: colors.bg, fontSize: 13, fontWeight: '700' },
});
