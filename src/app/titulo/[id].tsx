import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProgressStepper from '../../components/ProgressStepper';
import StatusPicker from '../../components/StatusPicker';
import { ErrorView, Loading } from '../../components/StateViews';
import { useAsync } from '../../hooks/useAsync';
import { openCategoria } from '../../navigation';
import { getTitulo, nomeExibicao } from '../../services/anilist';
import { useFavorites } from '../../storage/favorites';
import { useHistorico } from '../../storage/historico';
import { STATUS_COLOR, statusLabel, useLista } from '../../storage/lista';
import { colors } from '../../theme';

export default function TituloDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavorite, toggle } = useFavorites();
  const { getStatus, setStatus, getProgress, setProgress } = useLista();
  const [pickerOpen, setPickerOpen] = useState(false);
  const state = useAsync(() => getTitulo(id), [id]);
  const { registrar } = useHistorico();

  // Registra a visita no histórico assim que os dados chegam.
  useEffect(() => {
    if (state.data) registrar(state.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.data?.id]);

  if (state.loading && !state.data) return <Loading />;
  if (state.error || !state.data)
    return <ErrorView message={state.error ?? 'Título não encontrado.'} onRetry={state.reload} />;

  const t = state.data;
  const isAnime = t.kind === 'ANIME';
  const fav = isFavorite(t.id);
  const status = getStatus(t.id);

  const meta = [
    isAnime ? 'Anime' : 'Mangá',
    t.format,
    t.year ? String(t.year) : null,
    isAnime && t.episodes ? `${t.episodes} episódios` : null,
    !isAnime && t.chapters ? `${t.chapters} capítulos` : null,
    !isAnime && t.volumes ? `${t.volumes} volumes` : null,
    t.status,
  ].filter(Boolean);

  const credits = isAnime ? t.studios : t.authors;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: nomeExibicao(t) }} />

      <Image source={{ uri: t.coverLarge }} style={styles.poster} resizeMode="cover" />

      <Text style={styles.title}>{nomeExibicao(t)}</Text>
      {t.titleEnglish && t.title !== t.titleEnglish && <Text style={styles.original}>{t.title}</Text>}

      <View style={styles.row}>
        {t.score != null && (
          <View style={styles.scoreBox}>
            <Ionicons name="star" size={16} color={colors.score} />
            <Text style={styles.scoreText}>{t.score.toFixed(1)}</Text>
          </View>
        )}
        {t.rank != null && <Text style={styles.meta}>Posição #{t.rank}</Text>}
      </View>

      <Text style={styles.meta}>{meta.join(' | ')}</Text>

      {t.genres.length > 0 && (
        <View style={styles.chips}>
          {t.genres.map((g) => (
            <Pressable key={g} style={styles.chip} onPress={() => openCategoria(g, g, t.kind)}>
              <Text style={styles.chipText}>{g}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {credits.length > 0 && (
        <Text style={styles.meta}>
          {isAnime ? 'Estúdio' : 'Autoria'}: {credits.join(', ')}
        </Text>
      )}

      <View style={styles.actions}>
        <Pressable style={[styles.button, { flex: 1 }]} onPress={() => toggle(t)}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={18} color={colors.bg} />
          <Text style={styles.buttonText}>{fav ? 'Favoritado' : 'Favoritar'}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.outline, { flex: 1 }]}
          onPress={() => router.push({ pathname: '/personagens/[id]', params: { id: String(t.id) } })}
        >
          <Text style={[styles.buttonText, { color: colors.accent }]}>Personagens</Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.button, status ? { backgroundColor: STATUS_COLOR[status] } : styles.listBtn]}
        onPress={() => setPickerOpen(true)}
      >
        <Ionicons
          name={status ? 'checkmark-circle' : 'add-circle-outline'}
          size={18}
          color={status ? colors.bg : colors.accent}
        />
        <Text style={[styles.buttonText, !status && { color: colors.accent }]}>
          {status ? statusLabel(status, t.kind) : 'Adicionar à minha lista'}
        </Text>
      </Pressable>
      {status && (
        <ProgressStepper titulo={t} value={getProgress(t.id)} onChange={(n) => setProgress(t, n)} />
      )}
      <StatusPicker
        visible={pickerOpen}
        kind={t.kind}
        current={status}
        onClose={() => setPickerOpen(false)}
        onSelect={(s) => {
          setStatus(t, s);
          setPickerOpen(false);
        }}
      />

      <Text style={styles.heading}>Sinopse</Text>
      <Text style={styles.synopsis}>{t.synopsis || 'Este título ainda não tem sinopse.'}</Text>

      {t.trailerUrl && (
        <Pressable style={styles.button} onPress={() => Linking.openURL(t.trailerUrl as string)}>
          <Ionicons name="play" size={18} color={colors.bg} />
          <Text style={styles.buttonText}>Assistir trailer</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  poster: { width: '100%', height: 420, borderRadius: 12, backgroundColor: colors.surface },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 6 },
  original: { color: colors.textMuted, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  scoreBox: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  scoreText: { color: colors.text, fontWeight: '800', fontSize: 16 },
  meta: { color: colors.textMuted, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.accent, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4 },
  chipText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.accent, paddingVertical: 12, borderRadius: 10 },
  listBtn: { borderWidth: 1, borderColor: colors.accent, backgroundColor: 'transparent' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.accent },
  buttonText: { color: colors.bg, fontWeight: '800', fontSize: 15 },
  heading: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 8 },
  synopsis: { color: colors.text, fontSize: 15, lineHeight: 23 },
});
