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
import { colors } from '../theme';

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
  const itemW = Math.min(width * 0.88, 520);
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
      <Text style={styles.title}>{title}</Text>

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
            renderItem={({ item }) => <Banner titulo={item} width={itemW} />}
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

function Banner({ titulo, width }: { titulo: Titulo; width: number }) {
  const info = [titulo.format, titulo.year].filter(Boolean).join(' | ');
  return (
    <Pressable style={{ width }} onPress={() => openTitulo(titulo.id)}>
      <Image
        source={{ uri: titulo.banner || titulo.coverLarge }}
        style={{ width, height: width * 0.56, borderRadius: 12, backgroundColor: colors.surface }}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <Text style={styles.bannerTitle} numberOfLines={1}>
          {nomeExibicao(titulo)}
        </Text>
        <View style={styles.bannerRow}>
          {titulo.score != null && (
            <>
              <Ionicons name="star" size={13} color={colors.score} />
              <Text style={styles.bannerMeta}>{titulo.score.toFixed(1)}</Text>
            </>
          )}
          {info !== '' && <Text style={styles.bannerMeta}>{info}</Text>}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginHorizontal: 16, marginBottom: 12 },
  box: { height: 160, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 16 },
  error: { color: colors.textMuted, textAlign: 'center' },
  retry: { backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  retryText: { color: colors.bg, fontWeight: '700' },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(21,19,31,0.78)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  bannerTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bannerMeta: { color: colors.textMuted, fontSize: 13 },
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
