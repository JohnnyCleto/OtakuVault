import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GENRES, QUICK_GENRES } from '../genres';
import { colors, radius } from '../theme';

// Barra de gêneros da página inicial: "Todos", alguns gêneros rápidos
// e uma setinha que abre a lista completa. value = null significa "Todos".
export default function GenreChips({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (genre: string | null) => void;
}) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  // Se o gênero escolhido não estiver entre os rápidos, ele aparece logo após "Todos".
  const quick = value && !QUICK_GENRES.includes(value) ? [value, ...QUICK_GENRES] : QUICK_GENRES;
  const visible = quick.map((v) => GENRES.find((g) => g.value === v)!).filter(Boolean);

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <Chip label="Todos" icon="grid" active={value === null} onPress={() => onChange(null)} />
        {visible.map((g) => (
          <Chip
            key={g.value}
            label={g.label}
            icon={g.icon}
            active={value === g.value}
            onPress={() => onChange(g.value)}
          />
        ))}
        <Pressable style={styles.more} accessibilityLabel="Mais gêneros" onPress={() => setOpen(true)}>
          <Ionicons name="chevron-down" size={20} color={colors.text} />
        </Pressable>
      </ScrollView>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Gêneros</Text>
            <View style={styles.grid}>
              <Chip
                label="Todos"
                icon="grid"
                active={value === null}
                onPress={() => {
                  onChange(null);
                  setOpen(false);
                }}
              />
              {GENRES.map((g) => (
                <Chip
                  key={g.value}
                  label={g.label}
                  icon={g.icon}
                  active={value === g.value}
                  onPress={() => {
                    onChange(g.value);
                    setOpen(false);
                  }}
                />
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function Chip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: (typeof GENRES)[number]['icon'];
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Ionicons name={icon} size={16} color={active ? colors.bg : colors.textMuted} />
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { gap: 10, paddingHorizontal: 16, paddingBottom: 14 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: colors.accent },
  text: { color: colors.text, fontWeight: '600', fontSize: 14 },
  textActive: { color: colors.bg, fontWeight: '800' },
  more: {
    width: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 20,
    gap: 14,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  sheetTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
