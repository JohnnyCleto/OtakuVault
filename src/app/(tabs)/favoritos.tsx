import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import FilterChips, { Filter } from '../../components/FilterChips';
import TituloRow from '../../components/TituloRow';
import { useFavorites } from '../../storage/favorites';
import { colors } from '../../theme';

export default function FavoritosScreen() {
  const { favorites, toggle } = useFavorites();
  const [filter, setFilter] = useState<Filter>('TUDO');

  const list = filter === 'TUDO' ? favorites : favorites.filter((f) => f.kind === filter);

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>Favoritos</Text>
      <FilterChips value={filter} onChange={setFilter} />
    </View>
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={list}
      keyExtractor={(t) => String(t.id)}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nada por aqui ainda</Text>
          <Text style={styles.emptyText}>
            Abra um título e toque em "Favoritar" para salvá-lo nesta lista.
          </Text>
        </View>
      }
      renderItem={({ item }) => <TituloRow titulo={item} onRemove={() => toggle(item)} />}
    />
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, gap: 14 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  empty: { alignItems: 'center', padding: 32, gap: 8 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  emptyText: { color: colors.textMuted, textAlign: 'center' },
});
