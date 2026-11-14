import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import TituloRow from '../components/TituloRow';
import { STATUS_COLOR, STATUS_ORDER, STATUS_SHORT, StatusKey, statusLabel, useLista } from '../storage/lista';
import { colors } from '../theme';

type F = 'TODOS' | StatusKey;

export default function MinhaListaScreen() {
  const { entries, setStatus } = useLista();
  const [filter, setFilter] = useState<F>('TODOS');

  const count = (f: F) => (f === 'TODOS' ? entries.length : entries.filter((e) => e.status === f).length);
  const list = filter === 'TODOS' ? entries : entries.filter((e) => e.status === filter);

  const chips: { value: F; label: string }[] = [
    { value: 'TODOS', label: 'Todos' },
    ...STATUS_ORDER.map((s) => ({ value: s as F, label: STATUS_SHORT[s] })),
  ];

  const header = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {chips.map((c) => {
        const active = c.value === filter;
        return (
          <Pressable
            key={c.value}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => setFilter(c.value)}
          >
            <Text style={[styles.chipText, active && { color: colors.bg }]}>
              {c.label} ({count(c.value)})
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={list}
      keyExtractor={(e) => String(e.titulo.id)}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nada por aqui ainda</Text>
          <Text style={styles.emptyText}>
            Abra um título e toque em "Adicionar à minha lista" para marcar se está assistindo, completou, dropou ou não recomenda.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <TituloRow
          titulo={item.titulo}
          extraTag={{ label: statusLabel(item.status, item.titulo.kind), color: STATUS_COLOR[item.status] }}
          onRemove={() => setStatus(item.titulo, null)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  chips: { gap: 10, padding: 16 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  chipActive: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { color: colors.text, fontWeight: '600' },
  empty: { alignItems: 'center', padding: 32, gap: 8 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  emptyText: { color: colors.textMuted, textAlign: 'center' },
});
