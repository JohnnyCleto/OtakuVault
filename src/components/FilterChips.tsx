import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export type Filter = 'TUDO' | 'ANIME' | 'MANGA';

const OPTIONS: { value: Filter; label: string }[] = [
  { value: 'TUDO', label: 'Tudo' },
  { value: 'ANIME', label: 'Animes' },
  { value: 'MANGA', label: 'Mangás' },
];

export default function FilterChips({
  value,
  onChange,
}: {
  value: Filter;
  onChange: (v: Filter) => void;
}) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(o.value)}
          >
            <Text style={[styles.text, active && styles.textActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.text, borderColor: colors.text },
  text: { color: colors.text, fontWeight: '600' },
  textActive: { color: colors.bg },
});
