import { ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { clearCache } from '../services/anilist';
import { useAuth } from '../storage/auth';
import { useFavorites } from '../storage/favorites';
import { useLista } from '../storage/lista';
import { useSettings } from '../storage/settings';
import { APP_NAME, colors } from '../theme';
import { confirmar } from '../utils/confirm';

function Row({
  title,
  sub,
  onPress,
  danger,
  right,
}: {
  title: string;
  sub?: string;
  onPress?: () => void;
  danger?: boolean;
  right?: ReactNode;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, danger && { color: '#ff7b7b' }]}>{title}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={20} color={colors.textMuted} /> : null)}
    </Pressable>
  );
}

export default function ConfiguracoesScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const { favorites, clear: clearFavorites } = useFavorites();
  const { entries, clear: clearLista } = useLista();
  const { autoplay, setAutoplay } = useSettings();
  const [msg, setMsg] = useState<string | null>(null);

  async function onClearCache() {
    clearCache();
    setMsg('Cache limpo. Os dados serão buscados de novo.');
  }

  async function onClearFavorites() {
    if (favorites.length === 0) return setMsg('Você não tem favoritos para limpar.');
    if (await confirmar('Limpar favoritos', `Remover os ${favorites.length} favoritos?`, 'Limpar')) {
      await clearFavorites();
      setMsg('Favoritos removidos.');
    }
  }

  async function onClearLista() {
    if (entries.length === 0) return setMsg('Sua lista já está vazia.');
    if (await confirmar('Limpar minha lista', `Remover os ${entries.length} títulos marcados?`, 'Limpar')) {
      await clearLista();
      setMsg('Minha lista foi limpa.');
    }
  }

  async function onLogout() {
    await logout();
    router.replace('/');
  }

  async function onDeleteAccount() {
    const ok = await confirmar(
      'Excluir conta',
      'Isso apaga sua conta, seus favoritos e sua lista deste aparelho. Não dá para desfazer.',
      'Excluir'
    );
    if (ok) {
      await deleteAccount();
      router.replace('/');
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {msg && <Text style={styles.msg}>{msg}</Text>}

      <Text style={styles.section}>Aplicativo</Text>
      <View style={styles.card}>
        <Row
          title="Troca automática do carrossel"
          sub="Muda o destaque da Início a cada 5 segundos"
          right={
            <Switch
              value={autoplay}
              onValueChange={setAutoplay}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.text}
            />
          }
        />
      </View>

      <Text style={styles.section}>Dados</Text>
      <View style={styles.card}>
        <Row title="Atualizar dados da API" sub="Limpa o cache para buscar tudo de novo" onPress={onClearCache} />
        <Row title="Limpar favoritos" sub={`${favorites.length} salvos`} onPress={onClearFavorites} />
        <Row title="Limpar minha lista" sub={`${entries.length} títulos marcados`} onPress={onClearLista} />
      </View>

      <Text style={styles.section}>Conta</Text>
      <View style={styles.card}>
        {user ? (
          <>
            <Row title="Editar perfil" sub={user.email} onPress={() => router.push('/editar-perfil')} />
            <Row title="Sair da conta" onPress={onLogout} />
            <Row title="Excluir conta" sub="Apaga conta, favoritos e lista" onPress={onDeleteAccount} danger />
          </>
        ) : (
          <Row title="Entrar ou criar conta" onPress={() => router.push('/login')} />
        )}
      </View>

      <Text style={styles.section}>Sobre</Text>
      <View style={styles.card}>
        <Row title={APP_NAME} sub="Projeto acadêmico | versão 1.0" />
        <Row title="Fonte dos dados" sub="AniList (anilist.co)" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  msg: { color: '#4cc38a', fontSize: 14, backgroundColor: colors.surface, padding: 12, borderRadius: 10 },
  section: { color: colors.textMuted, fontSize: 13, fontWeight: '700', marginTop: 12, marginLeft: 4, textTransform: 'uppercase' },
  card: { backgroundColor: colors.surface, borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  rowSub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
