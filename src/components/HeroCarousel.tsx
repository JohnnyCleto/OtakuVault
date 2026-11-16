import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AsyncState } from '../hooks/useAsync';
import { openTitulo } from '../navigation';
import { nomeExibicao, Titulo } from '../services/anilist';
import { useSettings } from '../storage/settings';
import { colors, radius } from '../theme';

const GAP = 12;
const SIDE = 16;
const AUTOPLAY_MS = 5000;

export default function HeroCarousel({
  title,
  state,
}: {
  title: string;
  state: AsyncState<Titulo[]>;
}) {
  const { autoplay } = useSettings();
  const { width } = useWindowDimensions();
  const itemW = Math.min(width - SIDE * 2 - 24, 560);
  const step = itemW + GAP;
  const data = state.data ?? [];

  const listRef = useRef<FlatList<Titulo>>(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const [index, setIndex] = useState(0);

  function goTo(i: number) {
    const target = Math.max(0, Math.min(data.length - 1, i));
    listRef.current?.scrollToOffset({ offset: target * step, animated: true });
  }

  useEffect(() => {
    if (!autoplay || data.length < 2) return;
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      goTo((indexRef.current + 1) % data.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [data.length, step, autoplay]);

  return (
    <View style={styles.section}>
      {state.loading && !state.data ? (
        <View style={styles.box}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : state.error ? (
        <View style={styles.box}>
          <Text style={styles.error}>{state.error}</Text>
          <Pressable style={styles.retry} onPress={state.reload}>
            <Text style={styles.retryText}>Tentar de novo</Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <FlatList
            ref={listRef}
            data={data}
            horizontal
            keyExtractor={(t) => String(t.id)}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            directionalLockEnabled
            decelerationRate="fast"
            snapToOffsets={data.map((_, i) => i * step)}
            snapToAlignment="start"
            disableIntervalMomentum
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: SIDE }}
            ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
            ListFooterComponent={<View style={{ width: Math.max(0, width - itemW - SIDE * 2) }} />}
            onScroll={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / step);
              indexRef.current = i;
              setIndex(i);
            }}
            onScrollBeginDrag={() => {
              pausedRef.current = true;
            }}
            onScrollEndDrag={() => {
              pausedRef.current = false;
            }}
            renderItem={({ item }) => <Banner titulo={item} width={itemW} label={title} />}
          />

          {Platform.OS === 'web' && data.length > 1 && (
            <>
              <Pressable style={[styles.arrow, { left: 22 }]} onPress={() => goTo(indexRef.current - 1)}>
                <Ionicons name="chevron-back" size={26} color={colors.text} />
              </Pressable>
              <Pressable style={[styles.arrow, { right: 22 }]} onPress={() => goTo(indexRef.current + 1)}>
                <Ionicons name="chevron-forward" size={26} color={colors.text} />
              </Pressable>
            </>
          )}

          <View style={styles.dots}>
            {data.map((t, i) => (
              <View key={t.id} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// Faixas com opacidade crescente imitam um degradê escuro na base do banner,
// sem precisar de uma biblioteca de gradiente.
const FADE = [0.0, 0.15, 0.35, 0.6, 0.8];

function Banner({ titulo, width, label }: { titulo: Titulo; width: number; label: string }) {
  const height = Math.max(190, width * 0.52);
  const meta = [titulo.year].filter(Boolean).join('');

  return (
    <Pressable style={[styles.banner, { width, height }]} onPress={() => openTitulo(titulo.id)}>
      <Image
        source={{ uri: titulo.banner || titulo.coverLarge }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      <View style={styles.fade} pointerEvents="none">
        {FADE.map((o) => (
          <View key={o} style={{ flex: 1, backgroundColor: `rgba(21,19,31,${o})` }} />
        ))}
      </View>

      <View style={styles.badge}>
        <Ionicons name="star" size={13} color={colors.text} />
        <Text style={styles.badgeText}>{label}</Text>
      </View>

      <View style={styles.bottom}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.bannerTitle} numberOfLines={2}>
            {nomeExibicao(titulo)}
          </Text>
          <View style={styles.bannerRow}>
            {titulo.score != null && (
              <>
                <Ionicons name="star" size={14} color={colors.score} />
                <Text style={styles.bannerMeta}>{titulo.score.toFixed(1)}</Text>
              </>
            )}
            {titulo.score != null && meta !== '' && <Text style={styles.bannerMeta}>•</Text>}
            {meta !== '' && <Text style={styles.bannerMeta}>{meta}</Text>}
          </View>
        </View>

        <Pressable style={styles.watch} onPress={() => openTitulo(titulo.id)}>
          <View style={styles.play}>
            <Ionicons name="play" size={14} color={colors.text} />
          </View>
          <Text style={styles.watchText}>Assistir</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  box: { height: 190, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 16 },
  error: { color: colors.textMuted, textAlign: 'center' },
  retry: { backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  retryText: { color: colors.bg, fontWeight: '700' },
  banner: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%' },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  bottom: {
    position: 'absolute',
    left: 14,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  bannerTitle: { color: colors.text, fontSize: 19, fontWeight: '800', lineHeight: 23 },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bannerMeta: { color: colors.text, fontSize: 14, opacity: 0.85 },
  watch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(21,19,31,0.85)',
    borderRadius: radius.pill,
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 6,
  },
  play: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchText: { color: colors.text, fontWeight: '800', fontSize: 14 },
  arrow: {
    position: 'absolute',
    top: '38%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(21,19,31,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 20, backgroundColor: colors.accent },
});
