import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_VERSION } from '../appInfo';
import { APP_NAME_PARTS, colors, radius } from '../theme';

export default function SobreScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <View style={styles.logo}>
        <Ionicons name="star" size={40} color={colors.bg} />
      </View>
      <Text style={styles.name}>
        {APP_NAME_PARTS[0]}
        <Text style={{ color: colors.accent }}>{APP_NAME_PARTS[1]}</Text>
      </Text>
      <Text style={styles.muted}>Versão {APP_VERSION}</Text>

      <View style={styles.card}>
        <Text style={styles.text}>
          Catálogo de animes e mangás para descobrir títulos, salvar favoritos, acompanhar episódios e
          organizar o que você está assistindo.
        </Text>
        <Text style={styles.text}>Projeto acadêmico da disciplina de aplicativos nativos.</Text>
      </View>

      <Pressable style={styles.card} onPress={() => Linking.openURL('https://anilist.co')}>
        <View style={styles.row}>
          <Ionicons name="server-outline" size={22} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Dados por AniList</Text>
            <Text style={styles.muted}>Animes, mangás e personagens vêm da API pública da AniList.</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.textMuted} />
        </View>
      </Pressable>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="logo-react" size={22} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Feito com React Native e Expo</Text>
            <Text style={styles.muted}>Navegação com Expo Router e dados salvos com AsyncStorage.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, alignItems: 'stretch' },
  logo: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  name: { color: colors.text, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  muted: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  text: { color: colors.text, fontSize: 15, lineHeight: 22 },
});
