import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

// Título de seção com selo opcional (ex.: "+3") e link "Ver todos".
export default function SectionHeader({
  title,
  badge,
  onSeeAll,
}: {
  title: string;
  badge?: string;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>

      {onSeeAll && (
        <Pressable style={styles.seeAll} hitSlop={8} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>Ver todos</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', flexShrink: 1 },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  badgeText: { color: colors.text, fontSize: 11, fontWeight: '800' },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
});
