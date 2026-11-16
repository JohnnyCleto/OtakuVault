import { SectionList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ErrorView, Loading } from '../components/StateViews';
import TituloRow from '../components/TituloRow';
import { useNovidades } from '../hooks/useNovidades';
import { colors } from '../theme';

export default function NotificacoesScreen() {
  const { state, meus, outros } = useNovidades();

  if (state.loading && !state.data) return <Loading />;
  if (state.error) return <ErrorView message={state.error} onRetry={state.reload} />;

  const sections = [
    { title: 'Da sua lista e favoritos', data: meus },
    { title: 'Lançados nos últimos 3 dias', data: outros },
  ].filter((s) => s.data.length > 0);

  return (
    <SectionList
      style={{ flex: 1, backgroundColor: colors.bg }}
      sections={sections}
      keyExtractor={(e) => String(e.titulo.id)}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
      renderItem={({ item }) => (
        <TituloRow titulo={item.titulo} extraTag={{ label: `Episódio ${item.episode}`, color: colors.accent }} />
      )}
      ListHeaderComponent={
        meus.length === 0 ? (
          <View style={styles.tip}>
            <Ionicons name="notifications-outline" size={20} color={colors.accent} />
            <Text style={styles.tipText}>
              Favorite ou adicione animes à sua lista para ver os episódios novos deles em destaque aqui.
            </Text>
          </View>
        ) : undefined
      }
      ListEmptyComponent={<Text style={styles.empty}>Nenhum episódio novo nos últimos dias.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  section: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 4,
  },
  tip: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 12,
  },
  tipText: { color: colors.text, flex: 1, fontSize: 13 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
