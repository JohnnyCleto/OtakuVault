import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Titulo } from '../services/anilist';
import { colors, radius } from '../theme';

// Controle "− Ep. 3 de 12 +" para marcar até onde o usuário assistiu/leu.
export default function ProgressStepper({
  titulo,
  value,
  onChange,
}: {
  titulo: Titulo;
  value: number;
  onChange: (next: number) => void;
}) {
  const isAnime = titulo.kind === 'ANIME';
  const total = isAnime ? titulo.episodes : titulo.chapters;
  const unit = isAnime ? 'Ep.' : 'Cap.';
  const pct = total ? Math.min(1, value / total) : 0;

  return (
    <View style={styles.box}>
      <View style={styles.row}>
        <Pressable
          style={[styles.btn, value <= 0 && styles.disabled]}
          disabled={value <= 0}
          onPress={() => onChange(value - 1)}
          hitSlop={6}
        >
          <Ionicons name="remove" size={20} color={colors.text} />
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.label}>Meu progresso</Text>
          <Text style={styles.value}>
            {unit} {value}
            {total ? ` de ${total}` : ''}
          </Text>
        </View>

        <Pressable
          style={[styles.btn, styles.plus, total != null && value >= total && styles.disabled]}
          disabled={total != null && value >= total}
          onPress={() => onChange(value + 1)}
          hitSlop={6}
        >
          <Ionicons name="add" size={20} color={colors.text} />
        </Pressable>
      </View>

      {total ? (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct * 100}%` }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: { backgroundColor: colors.accent },
  disabled: { opacity: 0.35 },
  center: { flex: 1, alignItems: 'center' },
  label: { color: colors.textMuted, fontSize: 12 },
  value: { color: colors.text, fontSize: 16, fontWeight: '800' },
  track: { height: 5, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
});
