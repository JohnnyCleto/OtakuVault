import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FilterChips, { Filter } from '../components/FilterChips';
import TituloRow from '../components/TituloRow';
import { GENRES } from '../genres';
import { useAsync } from '../hooks/useAsync';
import { openCategoria } from '../navigation';
import { getGenreCovers, searchMedia } from '../services/anilist';
import { colors } from '../theme';

export default function BuscaScreen() {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filter, setFilter] = useState<Filter>('TUDO');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(text.trim()), 500);
    return () => clearTimeout(t);
  }, [text]);

  const searching = text.trim().length >= 2;
  const type = filter === 'TUDO' ? undefined : filter;
  const coverType = filter === 'MANGA' ? 'MANGA' : 'ANIME';

  const results = useAsync(
    () => (debounced.length >= 2 ? searchMedia({ search: debounced, type, perPage: 25 }) : Promise.resolve(null)),
    [debounced, filter]
  );
  const covers = useAsync(
    () => getGenreCovers(GENRES.map((g) => g.value), coverType),
    [coverType]
  );

  const topBar = (
    <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
      <Pressable hitSlop={10} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color={colors.text} />
      </Pressable>
      <View style={styles.inputBox}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="O que está procurando?"
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          autoFocus
          returnKeyType="search"
        />
        {text !== '' && (
          <Pressable hitSlop={10} onPress={() => setText('')}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );

  const chips = (
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <FilterChips value={filter} onChange={setFilter} />
    </View>
  );

  if (searching) {
    const items = results.data?.items ?? [];
    return (
      <View style={styles.screen}>
        {topBar}
        <FlatList
          data={items}
          keyExtractor={(t) => String(t.id)}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={chips}
          renderItem={({ item }) => <TituloRow titulo={item} />}
          ListEmptyComponent={
            results.loading ? (
              <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
            ) : results.error ? (
              <Text style={styles.message}>{results.error}</Text>
            ) : (
              <Text style={styles.message}>Nenhum resultado para "{debounced}".</Text>
            )
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {topBar}
      <FlatList
        data={GENRES}
        numColumns={2}
        keyExtractor={(g) => g.value}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <View>
            <View style={{ marginHorizontal: -16 }}>{chips}</View>
            <Text style={styles.heading}>Categorias</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cover = covers.data?.[item.value];
          return (
            <Pressable
              style={[styles.tile, { backgroundColor: item.color }]}
              onPress={() => openCategoria(item.value, item.label, filter)}
            >
              {cover && <Image source={{ uri: cover }} style={styles.tileImage} resizeMode="cover" />}
              <Text style={styles.tileText}>{item.label}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingBottom: 14 },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 46,
  },
  input: { flex: 1, color: colors.text, fontSize: 16 },
  heading: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 14 },
  tile: { flex: 1, height: 92, borderRadius: 14, overflow: 'hidden', justifyContent: 'center', paddingLeft: 14 },
  tileImage: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '48%', opacity: 0.9 },
  tileText: { color: '#fff', fontSize: 17, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  message: { color: colors.textMuted, textAlign: 'center', marginTop: 40, paddingHorizontal: 24 },
});
