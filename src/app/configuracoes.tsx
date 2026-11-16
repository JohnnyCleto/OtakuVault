import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import { DevSettings, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Sakura from '../components/Sakura';
import { APP_VERSION } from '../appInfo';
import { clearCache } from '../services/anilist';
import { useAuth } from '../storage/auth';
import { useFavorites } from '../storage/favorites';
import { useHistorico } from '../storage/historico';
import { useLista } from '../storage/lista';
import { useSettings } from '../storage/settings';
import { APP_NAME, APP_NAME_PARTS, colors, radius } from '../theme';
import { confirmar } from '../utils/confirm';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Flores decorativas no topo. Ficam longe do canto direito
// para não encostar no botão de fechar.
const PETALAS_TOPO = [
  { top: -14, right: 76, size: 44, opacity: 0.35 },
  { top: 44, right: 120, size: 16, opacity: 0.3 },
  { top: -4, left: '42%', size: 18, opacity: 0.25 },
  { top: 64, left: -8, size: 30, opacity: 0.2 },
] as const;

const DICAS = [
  'Os dados não atualizaram? Toque em "Recarregar" para buscar tudo de novo na AniList.',
  'Use os botões − e + nos detalhes de um anime para salvar o episódio em que parou.',
  'Toque na sua foto na aba Perfil para escolher um personagem como avatar.',
];

export default function ConfiguracoesScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, deleteAccount } = useAuth();
  const { favorites, clear: clearFavorites } = useFavorites();
  const { entries, clear: clearLista } = useLista();
  const { visitas, clear: clearHistorico } = useHistorico();
  const { autoplay, novidadesDot, salvarHistorico, setSetting } = useSettings();
  const [msg, setMsg] = useState<string | null>(null);
  const [dica] = useState(() => DICAS[Math.floor(Math.random() * DICAS.length)]);

  function fechar() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  function recarregar() {
    clearCache();
    if (Platform.OS === 'web') {
      (globalThis as any).location?.reload?.();
    } else if (__DEV__) {
      DevSettings.reload();
    } else {
      router.replace('/');
    }
  }

  async function limpar(
    total: number,
    vazio: string,
    titulo: string,
    pergunta: string,
    acao: () => Promise<void>,
    feito: string
  ) {
    if (total === 0) return setMsg(vazio);
    if (await confirmar(titulo, pergunta, 'Limpar')) {
      await acao();
      setMsg(feito);
    }
  }

  async function sair() {
    await logout();
    router.replace('/');
  }

  async function excluirConta() {
    const ok = await confirmar(
      'Excluir conta',
      'Isso apaga sua conta, seus favoritos, sua lista e seu histórico deste aparelho. Não dá para desfazer.',
      'Excluir'
    );
    if (ok) {
      await deleteAccount();
      router.replace('/');
    }
  }

  const toggle = (value: boolean, onChange: (v: boolean) => void) => (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: colors.border, true: colors.accent }}
      thumbColor={colors.text}
      ios_backgroundColor={colors.border}
    />
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {[0.22, 0.14, 0.08, 0.03, 0].map((o) => (
            <View key={o} style={{ flex: 1, backgroundColor: `rgba(255,79,139,${o})` }} />
          ))}
        </View>
        {PETALAS_TOPO.map((p, i) => (
          <Sakura
            key={i}
            size={p.size}
            opacity={p.opacity}
            style={[styles.abs, { top: p.top + insets.top }, 'left' in p ? { left: p.left } : { right: p.right }]}
          />
        ))}

        <View style={styles.heroRow}>
          <View style={styles.logo}>
            <Ionicons name="star" size={26} color={colors.bg} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.brand}>
              {APP_NAME_PARTS[0]}
              <Text style={{ color: colors.accent }}>{APP_NAME_PARTS[1]}</Text>
            </Text>
            <Text style={styles.muted}>Configurações · versão {APP_VERSION}</Text>
          </View>
          <Pressable style={styles.close} accessibilityLabel="Fechar" onPress={fechar} hitSlop={6}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.actions}>
          <ActionCard icon="refresh" title="Recarregar" sub="Atualizar o app" onPress={recarregar} />
          <ActionCard
            icon="home"
            title="Ir para Início"
            sub="Tela inicial"
            onPress={() => router.navigate('/')}
            highlight
          />
        </View>
      </View>

      <View style={styles.body}>
        {msg && (
          <Pressable style={styles.msg} onPress={() => setMsg(null)}>
            <Ionicons name="checkmark-circle" size={18} color="#4cc38a" />
            <Text style={styles.msgText}>{msg}</Text>
          </Pressable>
        )}

        <Section title="Preferências">
          <Row
            icon="play-circle-outline"
            title="Carrossel automático"
            sub="Troca o destaque do início a cada 5 segundos"
            right={toggle(autoplay, (v) => setSetting('autoplay', v))}
          />
          <Row
            icon="notifications-outline"
            title="Bolinha de novidades"
            sub="Avisa no sininho quando sai episódio novo"
            right={toggle(novidadesDot, (v) => setSetting('novidadesDot', v))}
          />
          <Row
            icon="time-outline"
            title="Salvar histórico"
            sub="Guarda os títulos que você abre"
            right={toggle(salvarHistorico, (v) => setSetting('salvarHistorico', v))}
          />
        </Section>

        <Section title="Dados">
          <Row
            icon="cloud-download-outline"
            title="Atualizar dados da API"
            sub="Limpa o cache para buscar tudo de novo"
            onPress={() => {
              clearCache();
              setMsg('Cache limpo. Os dados serão buscados de novo.');
            }}
          />
          <Row
            icon="heart-dislike-outline"
            title="Limpar favoritos"
            sub={`${favorites.length} salvos`}
            onPress={() =>
              limpar(favorites.length, 'Você não tem favoritos para limpar.', 'Limpar favoritos',
                `Remover os ${favorites.length} favoritos?`, clearFavorites, 'Favoritos removidos.')
            }
          />
          <Row
            icon="list-outline"
            title="Limpar minha lista"
            sub={`${entries.length} títulos marcados`}
            onPress={() =>
              limpar(entries.length, 'Sua lista já está vazia.', 'Limpar minha lista',
                `Remover os ${entries.length} títulos marcados?`, clearLista, 'Minha lista foi limpa.')
            }
          />
          <Row
            icon="trash-outline"
            title="Limpar histórico"
            sub={`${visitas.length} títulos vistos`}
            onPress={() =>
              limpar(visitas.length, 'Seu histórico já está vazio.', 'Limpar histórico',
                'Apagar todos os títulos do histórico?', clearHistorico, 'Histórico apagado.')
            }
          />
        </Section>

        <View style={styles.tip}>
          <Sakura size={44} opacity={0.3} style={[styles.abs, { right: 10, top: 6 }]} />
          <Sakura size={18} opacity={0.25} style={[styles.abs, { right: 60, bottom: 8 }]} />
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={24} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Dica</Text>
            <Text style={styles.tipText}>{dica}</Text>
          </View>
        </View>

        <Section title="Conta">
          {user ? (
            <>
              <Row icon="create-outline" title="Editar perfil" sub={user.email} onPress={() => router.push('/editar-perfil')} />
              <Row icon="log-out-outline" title="Sair da conta" sub="Você pode entrar de novo quando quiser" onPress={sair} />
              <Row icon="warning-outline" title="Excluir conta" sub="Apaga conta, favoritos, lista e histórico" onPress={excluirConta} danger />
            </>
          ) : (
            <Row icon="person-outline" title="Entrar ou criar conta" sub="Salve seus dados na sua conta" onPress={() => router.push('/login')} />
          )}
        </Section>

        <Section title="Sistema">
          <Row
            icon="information-circle-outline"
            title="Versão"
            sub={`${APP_NAME} • Projeto acadêmico`}
            right={<Text style={styles.value}>{APP_VERSION}</Text>}
            accent
          />
          <Row icon="server-outline" title="Fonte dos dados" sub="AniList (anilist.co)" onPress={() => router.push('/sobre')} accent />
        </Section>
      </View>
    </ScrollView>
  );
}

function ActionCard({
  icon,
  title,
  sub,
  onPress,
  highlight,
}: {
  icon: IconName;
  title: string;
  sub: string;
  onPress: () => void;
  highlight?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.action, highlight && styles.actionHighlight, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={30} color={colors.accent} />
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSub} numberOfLines={2}>
          {sub}
        </Text>
      </View>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.sectionRow}>
        <View style={styles.sectionBar} />
        <Text style={styles.section}>{title}</Text>
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  title,
  sub,
  onPress,
  right,
  danger,
  accent,
}: {
  icon: IconName;
  title: string;
  sub?: string;
  onPress?: () => void;
  right?: ReactNode;
  danger?: boolean;
  accent?: boolean;
}) {
  const color = danger ? '#ff7b7b' : accent ? colors.accent : colors.text;
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons name={icon} size={28} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, danger && { color }]}>{title}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={22} color={colors.text} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  abs: { position: 'absolute' },
  hero: { paddingHorizontal: 16, paddingBottom: 8, gap: 20, overflow: 'hidden' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { color: colors.text, fontSize: 24, fontWeight: '800' },
  muted: { color: colors.textMuted, fontSize: 13 },
  close: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(42,38,64,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { flexDirection: 'row', gap: 12 },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  actionHighlight: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  actionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  actionSub: { color: colors.textMuted, fontSize: 12 },
  body: { paddingHorizontal: 16, gap: 22, marginTop: 14 },
  msg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: radius.md,
  },
  msgText: { color: colors.text, fontSize: 14, flex: 1 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionBar: { width: 4, height: 22, borderRadius: 2, backgroundColor: colors.accent },
  section: { color: colors.text, fontSize: 20, fontWeight: '800' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  rowSub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  value: { color: colors.text, fontSize: 16, fontWeight: '600' },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: 16,
    overflow: 'hidden',
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: { color: colors.accent, fontSize: 16, fontWeight: '800' },
  tipText: { color: colors.text, fontSize: 14, lineHeight: 20 },
});
