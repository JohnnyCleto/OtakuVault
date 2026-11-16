import { ReactElement, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AsyncState } from '../hooks/useAsync';
import { colors } from '../theme';
import SectionHeader from './SectionHeader';

type CarouselProps<T> = {
  title?: string;
  state: AsyncState<T[]>;
  keyOf?: (item: T) => string;
  renderItem?: (item: T) => ReactElement;
  badge?: string;
  onSeeAll?: () => void;
};

export default function Carousel<T>({
  title = 'Carrossel',
  state,
  keyOf,
  renderItem,
  badge,
  onSeeAll,
}: CarouselProps<T>) {
  const listRef = useRef<FlatList<T>>(null);
  const offset = useRef(0);

  const defaultKeyOf = useCallback(
    (item: T, index: number) => {
      if (
        typeof item === 'object' &&
        item !== null &&
        'id' in item
      ) {
        return String(item.id);
      }

      return String(index);
    },
    []
  );

  const defaultRenderItem = useCallback(
    (item: T): ReactElement => {
      let label = '';

      if (typeof item === 'object' && item !== null) {
        if ('titleEnglish' in item && item.titleEnglish) {
          label = String(item.titleEnglish);
        } else if ('title' in item && item.title) {
          label = String(item.title);
        } else if ('titulo' in item && item.titulo) {
          const titulo = item.titulo;

          if (typeof titulo === 'object' && titulo !== null && 'title' in titulo) {
            label = String(titulo.title);
          }
        }
      }

      return (
        <View style={styles.defaultCard}>
          <Text style={styles.defaultCardText} numberOfLines={2}>
            {label || 'Título indisponível'}
          </Text>
        </View>
      );
    },
    []
  );

  const getKey = useCallback(
    (item: T, index: number) => {
      return typeof keyOf === 'function'
        ? keyOf(item)
        : defaultKeyOf(item, index);
    },
    [keyOf, defaultKeyOf]
  );

  const renderListItem = useCallback(
    ({ item }: { item: T }) => {
      const component =
        typeof renderItem === 'function'
          ? renderItem(item)
          : defaultRenderItem(item);

      return component;
    },
    [renderItem, defaultRenderItem]
  );

  const scrollBy = useCallback((delta: number) => {
    listRef.current?.scrollToOffset({
      offset: Math.max(0, offset.current + delta),
      animated: true,
    });
  }, []);

  return (
    <View style={styles.section}>
      <SectionHeader title={title} badge={badge} onSeeAll={onSeeAll} />

      {state.loading && !state.data ? (
        <View style={styles.box}>
          <ActivityIndicator
            color={colors.accent}
            size="large"
          />
        </View>
      ) : state.error ? (
        <View style={styles.box}>
          <Text style={styles.error}>
            {state.error}
          </Text>

          <Pressable
            style={styles.retry}
            onPress={state.reload}
          >
            <Text style={styles.retryText}>
              Tentar de novo
            </Text>
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
          <FlatList<T>
            ref={listRef}
            data={state.data}
            horizontal
            renderItem={renderListItem}
            keyExtractor={(item, index) => getKey(item, index)}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            directionalLockEnabled
            decelerationRate="fast"
            scrollEventThrottle={16}
            onScroll={(event) => {
              offset.current = event.nativeEvent.contentOffset.x;
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
    marginBottom: 24,
  },

  list: {
    paddingHorizontal: 16,
  },

  separator: {
    width: 12,
  },

  box: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
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
    top: 50,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(21,19,31,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  leftArrow: {
    left: 6,
  },

  rightArrow: {
    right: 6,
  },

  defaultCard: {
    width: 140,
    minHeight: 100,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },

  defaultCardText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
