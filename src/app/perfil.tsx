import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import { useAuth } from '../storage/auth';
import { useFavorites } from '../storage/favorites';
import { STATUS_COLOR, STATUS_ORDER, STATUS_SHORT, useLista } from '../storage/lista';
import { colors } from '../theme';

export default function PerfilScreen() {
  const { user, ready } = useAuth();
  const { favorites } = useFavorites();
  const { entries } = useLista();

  if (!ready) return <View style={styles.screen} />;

  if (!user) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.name}>Você não está logado</Text>
        <Text style={styles.bio}>Entre para salvar seus favoritos na sua conta.</Text>
        <Pressable style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>Entrar ou criar conta</Text>
        </Pressable>
      </View>
    );
  }

  const since = user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '—';

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Pressable accessibilityLabel="Trocar foto de perfil" onPress={() => router.push('/escolher-avatar')}>
          <Avatar user={user} size={88} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.bio}>
            {user.bio ? user.bio : `${user.name} ainda não disse nada sobre si.`}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        {STATUS_ORDER.map((st) => (
          <View key={st} style={styles.stat}>
            <Text style={[styles.statNumber, { color: STATUS_COLOR[st] }]}>
              {entries.filter((e) => e.status === st).length}
            </Text>
            <Text style={styles.statLabel}>{STATUS_SHORT[st]}</Text>
          </View>
        ))}
      </View>
      <Pressable
        style={[styles.card, { marginHorizontal: 16 }]}
        onPress={() => router.push('/minha-lista')}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Minha lista</Text>
          <Text style={styles.bio}>{entries.length} títulos marcados</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.text} />
      </Pressable>

      <View style={styles.cards}>
        <Pressable style={styles.card} onPress={() => router.navigate('/favoritos')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Favoritos</Text>
            <Text style={styles.bio}>
              {favorites.length} {favorites.length === 1 ? 'item' : 'itens'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.card}>
          <View>
            <Text style={styles.cardTitle}>Membro desde</Text>
            <Text style={styles.bio}>{since}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: colors.hero, padding: 20, paddingTop: 28, paddingBottom: 28 },
  name: { color: colors.text, fontSize: 24, fontWeight: '800' },
  bio: { color: colors.textMuted, fontSize: 14 },
  stats: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 12 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 12, alignItems: 'center', gap: 2 },
  statNumber: { fontSize: 24, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
  cards: { flexDirection: 'row', gap: 12, padding: 16 },
  card: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 14 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  button: { backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  buttonText: { color: colors.bg, fontWeight: '800' },
});
