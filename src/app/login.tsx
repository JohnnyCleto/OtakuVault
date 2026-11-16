import { useRef, useState } from 'react';
import type { ComponentProps, ComponentRef, ReactNode, Ref } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Sakura from '../components/Sakura';
import { useAsync } from '../hooks/useAsync';
import { getTrending } from '../services/anilist';
import { useAuth } from '../storage/auth';
import { APP_NAME_PARTS, colors, radius } from '../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type Modo = 'entrar' | 'criar';
type InputRef = ComponentRef<typeof TextInput>;

const COLUNAS = 4;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { login, register, continuarComoVisitante } = useAuth();

  const [modo, setModo] = useState<Modo>('entrar');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const emailRef = useRef<InputRef>(null);
  const senhaRef = useRef<InputRef>(null);
  const confirmRef = useRef<InputRef>(null);

  // Capas dos animes em alta formam o fundo do topo.
  const capas = useAsync(() => getTrending('ANIME', 12), []);
  const capaW = (Math.min(width, 700) + 80) / COLUNAS;

  function trocarModo(m: Modo) {
    setModo(m);
    setError(null);
    setConfirm('');
  }

  async function enviar() {
    setError(null);
    if (modo === 'criar' && password !== confirm) {
      setError('As senhas não são iguais.');
      return;
    }
    setBusy(true);
    try {
      if (modo === 'entrar') await login(email, password);
      else await register(name, email, password);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setBusy(false);
    }
  }

  function semConta() {
    continuarComoVisitante();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  const criando = modo === 'criar';

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={[styles.hero, { height: 300 + insets.top }]}>
          <View style={styles.collage} pointerEvents="none">
            {(capas.data ?? []).map((t) => (
              <Image
                key={t.id}
                source={{ uri: t.cover }}
                style={{ width: capaW - 8, height: (capaW - 8) * 1.4, borderRadius: radius.sm, margin: 4 }}
                resizeMode="cover"
              />
            ))}
          </View>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {[0.55, 0.6, 0.7, 0.82, 0.93, 1].map((o) => (
              <View key={o} style={{ flex: 1, backgroundColor: `rgba(21,19,31,${o})` }} />
            ))}
          </View>

          <Sakura size={40} opacity={0.45} style={[styles.abs, { top: insets.top + 24, left: 20 }]} />
          <Sakura size={22} opacity={0.35} style={[styles.abs, { top: insets.top + 90, right: 34 }]} />
          <Sakura size={16} opacity={0.3} style={[styles.abs, { top: insets.top + 150, left: 70 }]} />

          {router.canGoBack() && (
            <Pressable
              style={[styles.close, { top: insets.top + 12 }]}
              accessibilityLabel="Fechar"
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          )}

          <View style={styles.brandBox}>
            <View style={styles.logo}>
              <Ionicons name="star" size={34} color={colors.bg} />
            </View>
            <Text style={styles.brand}>
              {APP_NAME_PARTS[0]}
              <Text style={{ color: colors.accent }}>{APP_NAME_PARTS[1]}</Text>
            </Text>
            <Text style={styles.tagline}>Seu cofre de animes e mangás</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{criando ? 'Crie sua conta' : 'Bem-vindo de volta!'}</Text>
          <Text style={styles.subtitle}>
            {criando
              ? 'Salve favoritos, monte sua lista e escolha um personagem como foto.'
              : 'Entre para ver seus favoritos, sua lista e seu histórico.'}
          </Text>

          <View style={styles.tabs}>
            {(['entrar', 'criar'] as const).map((m) => (
              <Pressable key={m} style={[styles.tab, modo === m && styles.tabActive]} onPress={() => trocarModo(m)}>
                <Text style={[styles.tabText, modo === m && styles.tabTextActive]}>
                  {m === 'entrar' ? 'Entrar' : 'Criar conta'}
                </Text>
              </Pressable>
            ))}
          </View>

          {criando && (
            <Campo
              icon="person-outline"
              placeholder="Seu nome"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          )}
          <Campo
            ref={emailRef}
            icon="mail-outline"
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => senhaRef.current?.focus()}
          />
          <Campo
            ref={senhaRef}
            icon="lock-closed-outline"
            placeholder={criando ? 'Senha (mínimo 6 caracteres)' : 'Senha'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!verSenha}
            returnKeyType={criando ? 'next' : 'go'}
            onSubmitEditing={() => (criando ? confirmRef.current?.focus() : enviar())}
            right={
              <Pressable
                hitSlop={10}
                accessibilityLabel={verSenha ? 'Esconder senha' : 'Mostrar senha'}
                onPress={() => setVerSenha((v) => !v)}
              >
                <Ionicons name={verSenha ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
              </Pressable>
            }
          />
          {criando && (
            <Campo
              ref={confirmRef}
              icon="shield-checkmark-outline"
              placeholder="Confirme a senha"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!verSenha}
              returnKeyType="go"
              onSubmitEditing={enviar}
            />
          )}

          {error && (
            <View style={styles.error}>
              <Ionicons name="alert-circle" size={18} color="#ff8a8a" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.button, (busy || pressed) && { opacity: 0.75 }]}
            onPress={enviar}
            disabled={busy}
          >
            <Text style={styles.buttonText}>{busy ? 'Aguarde...' : criando ? 'Criar conta' : 'Entrar'}</Text>
            {!busy && <Ionicons name="arrow-forward" size={20} color={colors.bg} />}
          </Pressable>

          <Pressable style={styles.switch} onPress={() => trocarModo(criando ? 'entrar' : 'criar')}>
            <Text style={styles.switchText}>
              {criando ? 'Já tem conta? ' : 'Ainda não tem conta? '}
              <Text style={{ color: colors.accent, fontWeight: '800' }}>{criando ? 'Entrar' : 'Cadastre-se'}</Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.orRow}>
          <View style={styles.line} />
          <Text style={styles.orText}>ou</Text>
          <View style={styles.line} />
        </View>

        <Pressable style={styles.guest} onPress={semConta}>
          <Ionicons name="eye-outline" size={20} color={colors.text} />
          <Text style={styles.guestText}>Continuar sem conta</Text>
        </Pressable>
        <Text style={styles.note}>Seus dados ficam salvos apenas neste aparelho.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({
  icon,
  right,
  ref,
  ...props
}: TextInputProps & { icon: IconName; right?: ReactNode; ref?: Ref<InputRef> }) {
  const [foco, setFoco] = useState(false);
  return (
    <View style={[styles.field, foco && styles.fieldFocus]}>
      <Ionicons name={icon} size={20} color={foco ? colors.accent : colors.textMuted} />
      <TextInput
        ref={ref}
        style={styles.input}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        {...props}
      />
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  abs: { position: 'absolute' },
  hero: { overflow: 'hidden', justifyContent: 'flex-end' },
  collage: {
    position: 'absolute',
    top: -40,
    left: -40,
    right: -40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    transform: [{ rotate: '-8deg' }],
  },
  close: {
    position: 'absolute',
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(42,38,64,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBox: { alignItems: 'center', gap: 6, paddingBottom: 18 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  brand: { color: colors.text, fontSize: 32, fontWeight: '800', marginTop: 6 },
  tagline: { color: colors.textMuted, fontSize: 15 },
  card: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 12,
    width: undefined,
    maxWidth: 560,
    alignSelf: 'stretch',
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: -6 },
  tabs: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: radius.md, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.sm + 2, alignItems: 'center' },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.textMuted, fontWeight: '700', fontSize: 15 },
  tabTextActive: { color: colors.bg, fontWeight: '800' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  fieldFocus: { borderColor: colors.accent },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 13 },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderRadius: radius.sm,
    padding: 10,
  },
  errorText: { color: '#ff8a8a', fontSize: 14, flex: 1 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 15,
    borderRadius: radius.md,
    marginTop: 4,
  },
  buttonText: { color: colors.bg, fontWeight: '800', fontSize: 16 },
  switch: { alignItems: 'center', paddingVertical: 4 },
  switchText: { color: colors.textMuted, fontSize: 14 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 32, marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { color: colors.textMuted, fontSize: 13 },
  guest: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  guestText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  note: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 10 },
});
