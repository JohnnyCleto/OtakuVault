import { useEffect, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Image, Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProgressStepper from '../../components/ProgressStepper';
import StatusPicker from '../../components/StatusPicker';
import { ErrorView, Loading } from '../../components/StateViews';
import WatchSheet from '../../components/WatchSheet';
import { genreLabel } from '../../genres';
import { useAsync } from '../../hooks/useAsync';
import { openCategoria } from '../../navigation';
import { getTitulo, nomeExibicao, Titulo } from '../../services/anilist';
import { useFavorites } from '../../storage/favorites';
import { useHistorico } from '../../storage/historico';
import { useSettings } from '../../storage/settings';
import { STATUS_COLOR, statusLabel, useLista } from '../../storage/lista';
import { colors, radius } from '../../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const BANNER_H = 230;
const COVER_W = 116;

export default function TituloDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const { isFavorite, toggle } = useFavorites();
  const { getStatus, setStatus, getProgress, setProgress } = useLista();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [watchOpen, setWatchOpen] = useState(false);
  const state = useAsync(() => getTitulo(id), [id]);
  const { registrar } = useHistorico();
  const { salvarHistorico } = useSettings();

  // Registra a visita no histórico assim que os dados chegam.
  useEffect(() => {
    if (state.data && salvarHistorico) registrar(state.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.data?.id]);

  if (state.loading && !state.data) return <Loading />;
  if (state.error || !state.data)
    return <ErrorView message={state.error ?? 'Título não encontrado.'} onRetry={state.reload} />;

  const t = state.data;
  const isAnime = t.kind === 'ANIME';
  const fav = isFavorite(t.id);
  const status = getStatus(t.id);
  const nome = nomeExibicao(t);
  const credits = isAnime ? t.studios : t.authors;
  const temOndeAssistir = (t.ondeAssistir?.length ?? 0) > 0 || t.trailerUrl != null;

  const meta = [isAnime ? 'Anime' : 'Mangá', t.format, t.year ? String(t.year) : null, t.status].filter(Boolean);

  function compartilhar() {
    Share.share({ message: `${nome} no OtakuVault\n${t.url}` }).catch(() => {});
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen
        options={{
          title: nome,
          headerRight: () => (
            <Pressable
              style={styles.gear}
              accessibilityLabel="Configurações"
              onPress={() => router.push('/configuracoes')}
            >
              <Ionicons name="settings-sharp" size={20} color={colors.accent} />
            </Pressable>
          ),
        }}
      />

      <View style={{ height: BANNER_H }}>
        <Image
          source={{ uri: t.banner || t.coverLarge }}
          style={{ width, height: BANNER_H, backgroundColor: colors.surface }}
          resizeMode="cover"
        />
        <View style={styles.fade} pointerEvents="none">
          {[0, 0.25, 0.55, 0.85, 1].map((o) => (
            <View key={o} style={{ flex: 1, backgroundColor: `rgba(21,19,31,${o})` }} />
          ))}
        </View>
      </View>

      <View style={styles.head}>
        <Image source={{ uri: t.coverLarge }} style={styles.cover} resizeMode="cover" />

        <View style={styles.headInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={3}>
              {nome}
            </Text>
            <Pressable
              style={styles.iconBtn}
              hitSlop={6}
              accessibilityLabel="Minha lista"
              onPress={() => setPickerOpen(true)}
            >
              <Ionicons name={status ? 'bookmark' : 'bookmark-outline'} size={22} color={status ? colors.accent : colors.text} />
            </Pressable>
            <Pressable style={styles.iconBtn} hitSlop={6} accessibilityLabel="Compartilhar" onPress={compartilhar}>
              <Ionicons name="share-social-outline" size={22} color={colors.text} />
            </Pressable>
          </View>
          {t.titleEnglish && t.title !== t.titleEnglish && (
            <Text style={styles.original} numberOfLines={1}>
              {t.title}
            </Text>
          )}

          <View style={styles.scoreRow}>
            {t.score != null && (
              <View style={styles.scoreBox}>
                <Ionicons name="star" size={16} color={colors.accent} />
                <Text style={styles.scoreText}>{t.score.toFixed(1)}</Text>
              </View>
            )}
            {t.score != null && t.rank != null && <View style={styles.vline} />}
            {t.rank != null && <Text style={styles.meta}>Posição #{t.rank}</Text>}
          </View>

          <Text style={styles.meta}>{meta.join(' • ')}</Text>
        </View>
      </View>

      <View style={styles.body}>
        {t.genres.length > 0 && (
          <View style={styles.chips}>
            {t.genres.map((g) => (
              <Pressable key={g} style={styles.chip} onPress={() => openCategoria(g, genreLabel(g), t.kind)}>
                <Text style={styles.chipText}>{genreLabel(g)}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        <Pressable
          style={[styles.button, styles.watch, !temOndeAssistir && { opacity: 0.5 }]}
          disabled={!temOndeAssistir}
          onPress={() => setWatchOpen(true)}
        >
          <View style={styles.playCircle}>
            <Ionicons name={isAnime ? 'play' : 'book'} size={16} color={colors.accent} />
          </View>
          <Text style={styles.buttonText}>
            {temOndeAssistir ? (isAnime ? 'Assistir' : 'Ler') : 'Indisponível para assistir'}
          </Text>
        </Pressable>

        <View style={styles.actions}>
          <Pressable style={[styles.button, fav ? styles.filled : styles.outline, { flex: 1 }]} onPress={() => toggle(t)}>
            <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? colors.bg : colors.accent} />
            <Text style={[styles.buttonText, !fav && { color: colors.accent }]}>{fav ? 'Favoritado' : 'Favoritar'}</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.outline, { flex: 1 }]}
            onPress={() => router.push({ pathname: '/personagens/[id]', params: { id: String(t.id) } })}
          >
            <Ionicons name="people-outline" size={20} color={colors.accent} />
            <Text style={[styles.buttonText, { color: colors.accent }]}>Personagens</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.button, status ? { backgroundColor: STATUS_COLOR[status] } : styles.outline]}
          onPress={() => setPickerOpen(true)}
        >
          <Ionicons
            name={status ? 'checkmark-circle' : 'add-circle-outline'}
            size={20}
            color={status ? colors.bg : colors.accent}
          />
          <Text style={[styles.buttonText, !status && { color: colors.accent }]}>
            {status ? statusLabel(status, t.kind) : 'Adicionar à minha lista'}
          </Text>
        </Pressable>

        {status && <ProgressStepper titulo={t} value={getProgress(t.id)} onChange={(n) => setProgress(t, n)} />}

        <SectionTitle>Sinopse</SectionTitle>
        <Text style={styles.synopsis}>{t.synopsis || 'Este título ainda não tem sinopse.'}</Text>

        <Detalhes titulo={t} credits={credits} />
      </View>

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
      <WatchSheet titulo={t} visible={watchOpen} onClose={() => setWatchOpen(false)} />
    </ScrollView>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionBar} />
      <Text style={styles.heading}>{children}</Text>
    </View>
  );
}

function Detalhes({ titulo: t, credits }: { titulo: Titulo; credits: string[] }) {
  const isAnime = t.kind === 'ANIME';
  const total = isAnime ? t.episodes : t.chapters;

  const itens: { icon: IconName; label: string; value: string; dot?: boolean }[] = [
    { icon: 'calendar-outline', label: 'Ano', value: t.year ? String(t.year) : 'A definir' },
    {
      icon: isAnime ? 'play-outline' : 'document-text-outline',
      label: isAnime ? 'Episódios' : 'Capítulos',
      value: total ? String(total) : 'A definir',
    },
    { icon: 'stats-chart-outline', label: 'Status', value: t.status ?? 'A definir', dot: true },
  ];

  return (
    <View style={styles.details}>
      <View style={styles.detailsHead}>
        <Ionicons name={isAnime ? 'tv-outline' : 'book-outline'} size={28} color={colors.accent} />
        <Text style={styles.detailsTitle}>Detalhes</Text>
      </View>

      <View style={styles.detailsRow}>
        {itens.map((it, i) => (
          <View key={it.label} style={[styles.detailCol, i > 0 && styles.detailSep]}>
            <View style={styles.detailLabelRow}>
              <Ionicons name={it.icon} size={14} color={colors.textMuted} />
              <Text style={styles.detailLabel}>{it.label}</Text>
            </View>
            <View style={styles.detailLabelRow}>
              {it.dot && <View style={styles.dot} />}
              <Text style={styles.detailValue} numberOfLines={2}>
                {it.value}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {credits.length > 0 && (
        <Text style={styles.credits}>
          <Text style={{ color: colors.textMuted }}>{isAnime ? 'Estúdio: ' : 'Autoria: '}</Text>
          {credits.join(', ')}
        </Text>
      )}
      {!isAnime && t.volumes ? (
        <Text style={styles.credits}>
          <Text style={{ color: colors.textMuted }}>Volumes: </Text>
          {t.volumes}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  gear: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '70%' },
  head: { flexDirection: 'row', gap: 14, paddingHorizontal: 16, marginTop: -110 },
  cover: {
    width: COVER_W,
    height: COVER_W * 1.45,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headInfo: { flex: 1, gap: 8, paddingTop: 56 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', flex: 1 },
  original: { color: colors.textMuted, fontSize: 13, marginTop: -4 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(21,19,31,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  scoreText: { color: colors.text, fontWeight: '800', fontSize: 16 },
  vline: { width: 1, height: 18, backgroundColor: colors.border },
  meta: { color: colors.textMuted, fontSize: 14 },
  body: { paddingHorizontal: 16, gap: 12, marginTop: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 },
  chipText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  actions: { flexDirection: 'row', gap: 10 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: radius.md,
  },
  watch: { backgroundColor: colors.accent, paddingVertical: 15 },
  playCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: { backgroundColor: colors.accent },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.accent },
  buttonText: { color: colors.bg, fontWeight: '800', fontSize: 16 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  sectionBar: { width: 4, height: 22, borderRadius: 2, backgroundColor: colors.accent },
  heading: { color: colors.text, fontSize: 20, fontWeight: '800' },
  synopsis: { color: colors.text, fontSize: 15, lineHeight: 23 },
  details: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
    marginTop: 6,
  },
  detailsHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailsTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  detailsRow: { flexDirection: 'row' },
  detailCol: { flex: 1, gap: 4, paddingHorizontal: 8 },
  detailSep: { borderLeftWidth: 1, borderLeftColor: colors.border },
  detailLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailLabel: { color: colors.textMuted, fontSize: 12 },
  detailValue: { color: colors.text, fontSize: 14, fontWeight: '600', flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  credits: { color: colors.text, fontSize: 14 },
});
