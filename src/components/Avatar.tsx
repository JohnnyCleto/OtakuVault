import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { User } from '../storage/auth';
import { colors } from '../theme';

// Foto de perfil com anel rosa: imagem do personagem escolhido,
// inicial do nome se não houver foto, ou ícone de pessoa para visitantes.
export default function Avatar({ user, size = 56 }: { user: User | null; size?: number }) {
  const ring = Math.max(2, Math.round(size * 0.035));
  const inner = size - ring * 2 - 4;

  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderWidth: ring }]}>
      {user?.avatar ? (
        <Image
          source={{ uri: user.avatar }}
          style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: colors.surfaceAlt }}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.fallback, { width: inner, height: inner, borderRadius: inner / 2 }]}>
          {user ? (
            <Text style={[styles.initial, { fontSize: inner * 0.42 }]}>{user.name.charAt(0).toUpperCase()}</Text>
          ) : (
            <Ionicons name="person" size={inner * 0.5} color={colors.bg} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  fallback: { backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.bg, fontWeight: '800' },
});
