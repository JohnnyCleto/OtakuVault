import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { openTitulo } from '../navigation';
import { nomeExibicao, Titulo } from '../services/anilist';
import { colors } from '../theme';

export default function TituloCard({ titulo, width = 120 }: { titulo: Titulo; width?: number }) {
  return (
    <Pressable
      style={({ pressed }) => [{ width }, pressed && { opacity: 0.7 }]}
      onPress={() => openTitulo(titulo.id)}
    >
      <Image
        source={{ uri: titulo.cover }}
        style={{ width, height: width * 1.45, borderRadius: 10, backgroundColor: colors.surface }}
        resizeMode="cover"
      />
      {titulo.score != null && (
        <View style={styles.badge}>
          <Ionicons name="star" size={11} color={colors.score} />
          <Text style={styles.badgeText}>{titulo.score.toFixed(1)}</Text>
        </View>
      )}
      <Text style={styles.title} numberOfLines={2}>
        {nomeExibicao(titulo)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  title: { color: colors.text, fontSize: 13, fontWeight: '600', marginTop: 6 },
});
