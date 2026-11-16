import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Avatar from '../components/Avatar';
import { useAuth } from '../storage/auth';
import { colors } from '../theme';

type Msg = { text: string; ok: boolean } | null;

const BIO_MAX = 160;

export default function EditarPerfilScreen() {
  const { user, updateProfile, changePassword } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [profileMsg, setProfileMsg] = useState<Msg>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passMsg, setPassMsg] = useState<Msg>(null);
  const [savingPass, setSavingPass] = useState(false);

  if (!user) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.heading}>Você não está logado</Text>
        <Text style={styles.muted}>Entre na sua conta para editar o perfil.</Text>
        <Pressable style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>Entrar ou criar conta</Text>
        </Pressable>
      </View>
    );
  }

  async function saveProfile() {
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      await updateProfile(name, bio);
      setProfileMsg({ text: 'Perfil atualizado!', ok: true });
    } catch (e) {
      setProfileMsg({ text: e instanceof Error ? e.message : 'Erro inesperado.', ok: false });
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword() {
    setPassMsg(null);
    if (next !== confirm) {
      setPassMsg({ text: 'A confirmação não é igual à nova senha.', ok: false });
      return;
    }
    setSavingPass(true);
    try {
      await changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      setPassMsg({ text: 'Senha alterada com sucesso!', ok: true });
    } catch (e) {
      setPassMsg({ text: e instanceof Error ? e.message : 'Erro inesperado.', ok: false });
    } finally {
      setSavingPass(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable style={styles.avatarBox} onPress={() => router.push('/escolher-avatar')}>
        <Avatar user={{ ...user, name: name.trim() || user.name }} size={96} />
        <Text style={styles.change}>Trocar foto</Text>
      </Pressable>
      <Text style={styles.muted}>{user.email}</Text>

      <Text style={styles.heading}>Dados do perfil</Text>
      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Seu nome"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Sobre mim</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={bio}
        onChangeText={setBio}
        placeholder="Conte um pouco sobre você e seus animes favoritos"
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={BIO_MAX}
      />
      <Text style={styles.counter}>
        {bio.length}/{BIO_MAX}
      </Text>

      {profileMsg && <Text style={profileMsg.ok ? styles.ok : styles.error}>{profileMsg.text}</Text>}
      <Pressable style={[styles.button, savingProfile && { opacity: 0.6 }]} onPress={saveProfile} disabled={savingProfile}>
        <Text style={styles.buttonText}>Salvar alterações</Text>
      </Pressable>

      <Text style={[styles.heading, { marginTop: 24 }]}>Alterar senha</Text>
      <TextInput
        style={styles.input}
        value={current}
        onChangeText={setCurrent}
        placeholder="Senha atual"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        value={next}
        onChangeText={setNext}
        placeholder="Nova senha (mínimo 6 caracteres)"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repita a nova senha"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
      />

      {passMsg && <Text style={passMsg.ok ? styles.ok : styles.error}>{passMsg.text}</Text>}
      <Pressable
        style={[styles.button, styles.outline, savingPass && { opacity: 0.6 }]}
        onPress={savePassword}
        disabled={savingPass}
      >
        <Text style={[styles.buttonText, { color: colors.accent }]}>Alterar senha</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  content: { padding: 20, gap: 10, paddingBottom: 40, alignItems: 'stretch' },
  avatarBox: { alignItems: 'center', alignSelf: 'center', gap: 8 },
  change: { color: colors.accent, fontWeight: '700', fontSize: 14 },
  muted: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  heading: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 12 },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: -4 },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  counter: { color: colors.textMuted, fontSize: 12, textAlign: 'right', marginTop: -4 },
  ok: { color: '#4cc38a', fontSize: 14 },
  error: { color: '#ff8a8a', fontSize: 14 },
  button: { backgroundColor: colors.accent, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 4, paddingHorizontal: 24 },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.accent },
  buttonText: { color: colors.bg, fontWeight: '800', fontSize: 15 },
});
