import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ErrorView, Loading } from '../../components/StateViews';
import { useAsync } from '../../hooks/useAsync';
import { getPersonagens, Personagem, ROLE_PT } from '../../services/anilist';
import { colors } from '../../theme';

const ROLE_COLOR: Record<string, string> = {
  MAIN: colors.accent,
  SUPPORTING: '#6c63a8',
  BACKGROUND: colors.border,
};

export default function PersonagensScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useAsync(() => getPersonagens(id), [id]);

  if (state.loading && !state.data) return <Loading />;
  if (state.error || !state.data)
    return <ErrorView message={state.error ?? 'Não foi possível carregar.'} onRetry={state.reload} />;

  const list = state.data;
  const data: (Personagem | null)[] = list.length % 2 ? [...list, null] : list;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={data}
      numColumns={2}
      keyExtractor={(c, i) => (c ? String(c.id) : `vazio-${i}`)}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      columnWrapperStyle={{ gap: 12 }}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      ListEmptyComponent={<Text style={styles.empty}>Nenhum personagem cadastrado para este título.</Text>}
      renderItem={({ item }) =>
        item ? (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            {item.nameNative && (
              <Text style={styles.native} numberOfLines={1}>
                {item.nameNative}
              </Text>
            )}
            <View style={[styles.role, { backgroundColor: ROLE_COLOR[item.role] ?? colors.border }]}>
              <Text style={styles.roleText}>{ROLE_PT[item.role] ?? item.role}</Text>
            </View>
            {item.voiceActor && (
              <Text style={styles.voice} numberOfLines={1}>
                Voz (JP): {item.voiceActor}
              </Text>
            )}
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: 4 },
  image: { width: '100%', aspectRatio: 0.75, borderRadius: 12, backgroundColor: colors.surface },
  name: { color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 4 },
  native: { color: colors.textMuted, fontSize: 13 },
  role: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2 },
  roleText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  voice: { color: colors.textMuted, fontSize: 12 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
