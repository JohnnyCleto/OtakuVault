import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { openTitulo } from '../navigation';
import { nomeExibicao, Titulo } from '../services/anilist';
import { colors, radius } from '../theme';

// Card largo da seção "Continue assistindo": imagem à esquerda com o episódio
// atual, nome, progresso e botão de play à direita.
export default function ContinueCard({
  titulo,
  progress,
  width,
}: {
  titulo: Titulo;
  progress: number;
  width: number;
}) {
  const isAnime = titulo.kind === 'ANIME';
  const unit = isAnime ? 'Ep.' : 'Cap.';
  const total = isAnime ? titulo.episodes : titulo.chapters;
  const atual = Math.max(1, progress);
  const pct = total ? Math.min(1, progress / total) : 0;
  const imgW = width * 0.46;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { width }, pressed && { opacity: 0.8 }]}
      onPress={() => openTitulo(titulo.id)}
    >
      <View style={{ width: imgW }}>
        <Image
          source={{ uri: titulo.banner || titulo.coverLarge }}
          style={{ width: imgW, height: '100%', minHeight: 104, backgroundColor: colors.surfaceAlt }}
          resizeMode="cover"
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unit} {atual}
          </Text>
        </View>
        <View style={styles.imgTrack}>
          <View style={[styles.fill, { width: `${pct * 100}%` }]} />
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {nomeExibicao(titulo)}
        </Text>
        <Text style={styles.sub}>
          {unit} {atual}
          {total ? ` de ${total}` : ''}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct * 100}%` }]} />
        </View>
      </View>

      <View style={styles.play}>
        <Ionicons name="play" size={20} color={colors.bg} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    minHeight: 104,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  imgTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  info: { flex: 1, paddingHorizontal: 12, gap: 6 },
  title: { color: colors.text, fontSize: 15, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 13 },
  track: { height: 4, borderRadius: 2, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent },
  play: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});
