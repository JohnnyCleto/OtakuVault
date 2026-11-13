
import { useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Titulo } from '../services/anilist';
import type { AsyncState } from '../hooks/useAsync';
import { colors } from '../theme';

type Props = {
  title: string;
  state: AsyncState<Titulo[]>;
};

export default function HeroCarousel({ title, state }: Props) {
  const listRef = useRef<FlatList<Titulo>>(null);
  const offset = useRef(0);

  const scrollBy = (delta: number) => {
    listRef.current?.scrollToOffset({
      offset: Math.max(0, offset.current + delta),
      animated: true,
    });
  };

  const renderItem = ({ item }: { item: Titulo }) => {
    const image = item.banner || item.coverLarge || item.cover;

    return (
      <View style={styles.card}>
        <Pressable
          style={styles.cardPressable}
          onPress={() => {
            // A navegação para a página de detalhes pode ser adicionada aqui.
          }}
        >
          <ImageBackground
            source={{ uri: image }}
            style={styles.image}
            imageStyle={styles.imageStyle}
          >
            <View style={styles.overlay}>
              <View style={styles.info}>
                {item.score != null && (
                  <View style={styles.score}>
                    <Ionicons
                      name="star"
                      size={13}
                      color={colors.score}
                    />
                    <Text style={styles.scoreText}>
                      {item.score.toFixed(1)}
                    </Text>
                  </View>
                )}

                <Text style={styles.name} numberOfLines={2}>
                  {item.titleEnglish || item.title}
                </Text>

                <Text style={styles.details} numberOfLines={1}>
                  {[item.year, item.format, item.status]
                    .filter(Boolean)
                    .join(' • ')}
                </Text>

                {item.synopsis && (
                  <Text style={styles.synopsis} numberOfLines={3}>
                    {item.synopsis}
                  </Text>
                )}
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>

      {state.loading && !state.data ? (
        <View style={styles.box}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : state.error ? (
        <View style={styles.box}>
          <Text style={styles.error}>{state.error}</Text>

          <Pressable
            style={styles.retry}
            onPress={state.reload}
          >
            <Text style={styles.retryText}>Tentar de novo</Text>
          </Pressable>
        </View>
      ) : !state.data?.length ? (
        <View style={styles.box}>
          <Text style={styles.error}>
            Nenhum título encontrado.
          </Text>
        </View>
      ) : (
        <View>
          <FlatList<Titulo>
            ref={listRef}
            data={state.data}
            horizontal
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            directionalLockEnabled
            decelerationRate="fast"
            scrollEventThrottle={16}
            onScroll={(e) => {
              offset.current = e.nativeEvent.contentOffset.x;
            }}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => (
              <View style={styles.separator} />
            )}
          />

          {Platform.OS === 'web' && (
            <>
              <Pressable
                style={[styles.arrow, styles.leftArrow]}
                onPress={() => scrollBy(-320)}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={colors.text}
                />
              </Pressable>

              <Pressable
                style={[styles.arrow, styles.rightArrow]}
                onPress={() => scrollBy(320)}
              >
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={colors.text}
                />
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },

  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginHorizontal: 16,
    marginBottom: 12,
  },

  list: {
    paddingHorizontal: 16,
  },

  separator: {
    width: 12,
  },

  card: {
    width: 310,
    height: 190,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },

  cardPressable: {
    flex: 1,
  },

  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },

  imageStyle: {
    resizeMode: 'cover',
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },

  info: {
    gap: 5,
  },

  score: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  scoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  name: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  details: {
    color: '#EEEEEE',
    fontSize: 11,
  },

  synopsis: {
    color: '#EEEEEE',
    fontSize: 11,
    lineHeight: 15,
  },

  box: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },

  error: {
    color: colors.textMuted,
    textAlign: 'center',
  },

  retry: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  retryText: {
    color: colors.bg,
    fontWeight: '700',
  },

  arrow: {
    position: 'absolute',
    top: 77,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(21,19,31,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  leftArrow: {
    left: 6,
  },

  rightArrow: {
    right: 6,
  },
});
