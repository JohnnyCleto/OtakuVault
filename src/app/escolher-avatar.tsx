import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import { ErrorView } from '../components/StateViews';
import { getPersonagensFoto, PersonagemFoto } from '../services/anilist';
import { useAuth } from '../storage/auth';
import { colors, radius } from '../theme';

const COLS = 3;
const GAP = 12;
const SIDE = 16;

export default function EscolherAvatarScreen() {
  const { user, updateAvatar } = useAuth();
  const { width } = useWindowDimensions();
  const cell = (Math.min(width, 700) - SIDE * 2 - GAP * (COLS - 1)) / COLS;

  const [texto, setTexto] = useState('');
  const [busca, setBusca] = useState('');
  const [items, setItems] = useState<PersonagemFoto[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Espera o usuário parar de digitar antes de buscar.
  useEffect(() => {
    const t = setTimeout(() => {
      setBusca(texto);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [texto]);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setError(null);
    getPersonagensFoto(busca, page)
      .then((res) => {
        if (cancel) return;
        setItems((prev) => {
          if (page === 1) return res.items;
          const ids = new Set(prev.map((p) => p.id));
          return [...prev, ...res.items.filter((i) => !ids.has(i.id))];
        });
        setHasNext(res.hasNext);
      })
      .catch((e) => !cancel && setError(e instanceof Error ? e.message : 'Erro inesperado.'))
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [busca, page, tick]);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Entre para escolher sua foto</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/login')}>
          <Text style={styles.buttonText}>Entrar ou criar conta</Text>
        </Pressable>
      </View>
    );
  }

  async function escolher(p: PersonagemFoto | null) {
    await updateAvatar(p ? p.image : null);
    router.back();
  }

  const header = (
    <View style={styles.header}>
      <View style={styles.preview}>
        <Avatar user={user} size={72} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Escolha seu personagem</Text>
          <Text style={styles.muted}>Toque em uma imagem para usar como foto de perfil.</Text>
        </View>
      </View>

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          value={texto}
          onChangeText={setTexto}
          placeholder="Buscar personagem (ex.: Hinata)"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />
        {texto !== '' && (
          <Pressable hitSlop={8} onPress={() => setTexto('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {user.avatar && (
        <Pressable style={styles.remove} onPress={() => escolher(null)}>
          <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
          <Text style={styles.muted}>Remover foto e usar a inicial do nome</Text>
        </Pressable>
      )}
    </View>
  );

  if (error && items.length === 0) {
    return <ErrorView message={error} onRetry={() => setTick((t) => t + 1)} />;
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingHorizontal: SIDE, paddingBottom: 32 }}
      data={items}
      keyExtractor={(p) => String(p.id)}
      numColumns={COLS}
      columnWrapperStyle={{ gap: GAP }}
      ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
      ListHeaderComponent={header}
      ListEmptyComponent={
        loading ? undefined : <Text style={[styles.muted, { textAlign: 'center' }]}>Nenhum personagem encontrado.</Text>
      }
      renderItem={({ item }) => {
        const atual = user.avatar === item.image;
        return (
          <Pressable style={{ width: cell }} onPress={() => escolher(item)}>
            <Image
              source={{ uri: item.image }}
              style={[styles.photo, { width: cell, height: cell * 1.3 }, atual && styles.photoActive]}
              resizeMode="cover"
            />
            {atual && (
              <View style={styles.check}>
                <Ionicons name="checkmark" size={14} color={colors.text} />
              </View>
            )}
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            {item.anime && (
              <Text style={styles.anime} numberOfLines={1}>
                {item.anime}
              </Text>
            )}
          </Pressable>
        );
      }}
      ListFooterComponent={
        loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
        ) : hasNext ? (
          <Pressable style={[styles.button, { marginTop: 20 }]} onPress={() => setPage((p) => p + 1)}>
            <Text style={styles.buttonText}>Carregar mais</Text>
          </Pressable>
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, backgroundColor: colors.bg },
  header: { gap: 14, paddingVertical: 16 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  muted: { color: colors.textMuted, fontSize: 13 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 12,
  },
  input: { flex: 1, color: colors.text, paddingVertical: 12, fontSize: 15 },
  remove: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  photo: { borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 2, borderColor: 'transparent' },
  photoActive: { borderColor: colors.accent },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 6 },
  anime: { color: colors.textMuted, fontSize: 11 },
  button: { backgroundColor: colors.accent, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: colors.bg, fontWeight: '800' },
});
