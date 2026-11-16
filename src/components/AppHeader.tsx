import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNovidades } from '../hooks/useNovidades';
import { APP_NAME_PARTS, colors } from '../theme';

export default function AppHeader() {
  const insets = useSafeAreaInsets();
  const { meus } = useNovidades();
  const temNovidade = meus.length > 0;

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Ionicons name="star" size={22} color={colors.bg} />
        </View>
        <Text style={styles.brandText}>
          {APP_NAME_PARTS[0]}
          <Text style={{ color: colors.accent }}>{APP_NAME_PARTS[1]}</Text>
        </Text>
      </View>

      <View style={styles.right}>
        <Pressable hitSlop={10} accessibilityLabel="Buscar" onPress={() => router.push('/busca')}>
          <Ionicons name="search" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable hitSlop={10} accessibilityLabel="Novidades" onPress={() => router.push('/notificacoes')}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          {temNovidade && <View style={styles.dot} />}
        </Pressable>

        <Pressable style={styles.gear} accessibilityLabel="Menu" onPress={() => router.push('/mais')}>
          <Ionicons name="settings-sharp" size={22} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { color: colors.text, fontSize: 22, fontWeight: '800' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  divider: { width: 1, height: 22, backgroundColor: colors.border },
  dot: {
    position: 'absolute',
    top: 0,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
  gear: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
