import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../storage/auth';
import { colors } from '../../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export default function MaisScreen() {
  const { user, logout } = useAuth();

  const items: { icon: IconName; title: string; sub: string; path: string }[] = [
    { icon: 'person-outline', title: 'Meu perfil', sub: 'Seus favoritos e dados da conta', path: user ? '/perfil' : '/login' },
    { icon: 'list-outline', title: 'Minha lista', sub: 'Assistindo, completos, dropados...', path: user ? '/minha-lista' : '/login' },
    { icon: 'create-outline', title: 'Editar perfil', sub: 'Deixe sua conta do seu jeito', path: '/editar-perfil' },
    { icon: 'settings-outline', title: 'Configurações', sub: 'Ajustes do aplicativo', path: '/configuracoes' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      {user ? (
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.sub}>{user.email}</Text>
          </View>
          <Pressable hitSlop={10} onPress={logout}>
            <Ionicons name="log-out-outline" size={28} color={colors.text} />
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.card} onPress={() => router.push('/login')}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.bg} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Entrar ou criar conta</Text>
            <Text style={styles.sub}>Salve seus favoritos na sua conta</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </Pressable>
      )}

      <View style={styles.card2}>
        {items.map((it) => (
          <Pressable key={it.title} style={styles.item} onPress={() => router.push(it.path as any)}>
            <Ionicons name={it.icon} size={28} color={colors.text} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{it.title}</Text>
              <Text style={styles.sub}>{it.sub}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={styles.footer}>Dados por AniList</Text>
      <Text style={styles.footer}>Projeto acadêmico | versão 1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: 14, padding: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.bg, fontSize: 24, fontWeight: '800' },
  name: { color: colors.text, fontSize: 18, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: 14 },
  card2: { backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 14 },
  itemTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  footer: { color: colors.textMuted, textAlign: 'center', fontSize: 13 },
});
