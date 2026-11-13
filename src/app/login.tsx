import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../storage/auth';
import { colors } from '../theme';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'entrar' | 'criar'>('entrar');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      if (mode === 'entrar') await login(email, password);
      else await register(name, email, password);
      router.replace('/perfil');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.tabs}>
        {(['entrar', 'criar'] as const).map((m) => (
          <Pressable key={m} style={[styles.tab, mode === m && styles.tabActive]} onPress={() => { setMode(m); setError(null); }}>
            <Text style={[styles.tabText, mode === m && { color: colors.bg }]}>
              {m === 'entrar' ? 'Entrar' : 'Criar conta'}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === 'criar' && (
        <TextInput style={styles.input} placeholder="Nome" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
      )}
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha (mínimo 6 caracteres)"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.button, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
        <Text style={styles.buttonText}>{mode === 'entrar' ? 'Entrar' : 'Criar conta'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 12 },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 10, padding: 4, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.textMuted, fontWeight: '700' },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  error: { color: '#ff8a8a', fontSize: 14 },
  button: { backgroundColor: colors.accent, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  buttonText: { color: colors.bg, fontWeight: '800', fontSize: 15 },
});
