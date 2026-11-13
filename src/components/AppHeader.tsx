import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../storage/auth';
import { APP_NAME, colors } from '../theme';

export default function AppHeader() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Ionicons name="star" size={18} color={colors.bg} />
        </View>
        <Text style={styles.brandText}>{APP_NAME}</Text>
      </View>

      <View style={styles.right}>
        <Pressable hitSlop={10} onPress={() => router.push('/busca')}>
          <Ionicons name="search" size={26} color={colors.text} />
        </Pressable>
        <Pressable
          style={styles.avatar}
          onPress={() => router.push(user ? '/perfil' : '/login')}
        >
          {user ? (
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          ) : (
            <Ionicons name="person" size={20} color={colors.bg} />
          )}
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
    paddingBottom: 10,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { color: colors.text, fontSize: 20, fontWeight: '800' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.bg, fontSize: 18, fontWeight: '800' },
});
