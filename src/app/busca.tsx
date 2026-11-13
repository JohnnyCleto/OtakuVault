
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

type CarouselProps<T> = {
  title: string;
  state: AsyncState<T[]>;
  keyOf: (item: T) => string;
  renderItem: (item: T) => ReactElement;
};

export default function Carousel<T>({
  title,
  state,
  keyOf,
  renderItem,
}: CarouselProps<T>) {
  const listRef = useRef<FlatList<T>>(null);
  const offset = useRef(0);

  const scrollBy = useCallback((delta: number) => {
    listRef.current?.scrollToOffset({
      offset: Math.max(0, offset.current + delta),
      animated: true,
    });
  }, []);

  const renderListItem = useCallback(
    ({ item }: { item: T }) => renderItem(item),
    [renderItem]
  );

  if (typeof renderItem !== 'function') {
    console.error(
      `Carousel "${title}": renderItem precisa ser uma função.`
    );
    return null;
  }

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
          <FlatList<T>
            ref={listRef}
            data={state.data ?? []}
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            directionalLockEnabled
            decelerationRate="fast"
            scrollEventThrottle={16}
            onScroll={(e) => {
              offset.current = e.nativeEvent.contentOffset.x;
            }}
            keyExtractor={keyOf}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ItemSeparatorComponent={() => (
              <View style={{ width: 12 }} />
            )}
            renderItem={renderListItem}
          />

          {Platform.OS === 'web' && (
            <>
              <Pressable
                style={[styles.arrow, { left: 6 }]}
                onPress={() => scrollBy(-320)}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={colors.text}
                />
              </Pressable>

              <Pressable
                style={[styles.arrow, { right: 6 }]}
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
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginHorizontal: 16,
    marginBottom: 12,
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
});
