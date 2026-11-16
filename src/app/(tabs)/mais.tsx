import type { ComponentProps } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import Sakura from '../../components/Sakura';
import { APP_VERSION } from '../../appInfo';
import { useAuth } from '../../storage/auth';
import { confirmar } from '../../utils/confirm';
import { APP_NAME, colors, radius } from '../../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type Item = { icon: IconName; title: string; sub: string; onPress: () => void };

const go = (path: string) => () => router.push(path as never);

function avisar(title: string, message: string) {
  if (Platform.OS === 'web') (globalThis as any).alert?.(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

// Flores decorativas no canto do cartão de perfil.
const PETALAS = [
  { top: -6, right: 10, size: 46, opacity: 0.55 },
  { top: 34, right: 62, size: 18, opacity: 0.35 },
  { top: 64, right: -4, size: 38, opacity: 0.45 },
  { top: 104, right: 48, size: 16, opacity: 0.3 },
];

export default function MaisScreen() {
  const { user, logout } = useAuth();

  const conta: Item[] = [
    ...(!user
      ? [{ icon: 'person-outline' as IconName, title: 'Entrar ou criar conta', sub: 'Salve seus favoritos na sua conta', onPress: go('/login') }]
      : []),
    { icon: 'list-outline', title: 'Meu perfil', sub: 'Seus favoritos e dados da conta', onPress: go(user ? '/perfil' : '/login') },
    { icon: 'heart-outline', title: 'Minha lista', sub: 'Assistindo, completos, dropados...', onPress: go('/minha-lista') },
    ...(user
      ? [{ icon: 'create-outline' as IconName, title: 'Editar perfil', sub: 'Deixe sua conta do seu jeito', onPress: go('/editar-perfil') }]
      : []),
  ];

  const app: Item[] = [
    { icon: 'settings-outline', title: 'Configurações', sub: 'Ajustes do aplicativo', onPress: go('/configuracoes') },
  ];

  const info: Item[] = [
    { icon: 'help-circle-outline', title: 'Ajuda e suporte', sub: 'Tire suas dúvidas', onPress: go('/ajuda') },
    { icon: 'information-circle-outline', title: `Sobre o ${APP_NAME}`, sub: `Versão ${APP_VERSION}`, onPress: go('/sobre') },
  ];

  async function sair() {
    if (await confirmar('Sair da conta', 'Deseja sair da sua conta?', 'Sair')) logout();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <View style={styles.profile}>
        {PETALAS.map((p, i) => (
          <Sakura
            key={i}
            size={p.size}
            opacity={p.opacity}
            style={{ position: 'absolute', top: p.top, right: p.right }}
          />
        ))}

        <Pressable
          accessibilityLabel="Trocar foto de perfil"
          onPress={go(user ? '/escolher-avatar' : '/login')}
        >
          <Avatar user={user} size={92} />
          {user && (
            <View style={styles.camera}>
              <Ionicons name="camera" size={14} color={colors.text} />
            </View>
          )}
        </Pressable>

        <View style={{ flex: 1 }}>
          <Pressable style={styles.nameRow} onPress={go(user ? '/editar-perfil' : '/login')}>
            <Text style={styles.name} numberOfLines={1}>
              {user ? user.name : 'Visitante'}
            </Text>
            <Ionicons name="pencil-outline" size={18} color={colors.accent} />
          </Pressable>
          <Text style={styles.sub} numberOfLines={1}>
            {user ? user.email : 'Entre para ter foto e perfil'}
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.premium}
        onPress={() => avisar('Em breve', 'O OtakuVault Premium ainda está sendo preparado. Fique de olho!')}
      >
        <MaterialCommunityIcons name="crown" size={30} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.premiumTitle}>Seja Premium</Text>
          <Text style={styles.sub}>Desbloqueie mais recursos</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.text} />
      </Pressable>

      <Group items={conta} />
      <Group items={app} />
      <Group items={info} />

      {user && (
        <Pressable style={styles.logout} onPress={sair}>
          <Ionicons name="log-out-outline" size={22} color={colors.accent} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      )}

      <View style={styles.footerLine}>
        <View style={styles.line} />
        <Sakura size={18} />
        <View style={styles.line} />
      </View>
      <Text style={styles.footer}>
        Feito com amor por fãs de anime <Ionicons name="heart" size={14} color={colors.accent} />
      </Text>
    </ScrollView>
  );
}

function Group({ items }: { items: Item[] }) {
  return (
    <View style={styles.group}>
      {items.map((it, i) => (
        <Pressable
          key={it.title}
          style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
          onPress={it.onPress}
        >
          <Ionicons name={it.icon} size={28} color={colors.text} />
          <View style={[styles.itemBody, i > 0 && styles.divider]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{it.title}</Text>
              <Text style={styles.sub}>{it.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.text} />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    overflow: 'hidden',
  },
  camera: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: colors.text, fontSize: 19, fontWeight: '800', flexShrink: 1 },
  sub: { color: colors.textMuted, fontSize: 14 },
  premium: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  premiumTitle: { color: colors.accent, fontSize: 17, fontWeight: '800' },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 16,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  itemBody: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingRight: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  itemTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  logoutText: { color: colors.accent, fontSize: 16, fontWeight: '700' },
  footerLine: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  footer: { color: colors.textMuted, textAlign: 'center', fontSize: 14 },
});
