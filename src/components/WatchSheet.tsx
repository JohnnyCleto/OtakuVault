import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Titulo } from '../services/anilist';
import { colors, radius } from '../theme';

const IDIOMA_PT: Record<string, string> = {
  English: 'Inglês',
  Japanese: 'Japonês',
  Portuguese: 'Português',
  Spanish: 'Espanhol',
  French: 'Francês',
  German: 'Alemão',
  Italian: 'Italiano',
  Korean: 'Coreano',
  Chinese: 'Chinês',
  Thai: 'Tailandês',
  Indonesian: 'Indonésio',
  Vietnamese: 'Vietnamita',
};

// Janela "Onde assistir / Onde ler": lista os sites oficiais do título
// e, se houver, o trailer.
export default function WatchSheet({
  titulo,
  visible,
  onClose,
}: {
  titulo: Titulo;
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const isAnime = titulo.kind === 'ANIME';
  const links = titulo.ondeAssistir ?? [];

  function abrir(url: string) {
    onClose();
    Linking.openURL(url);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
          <Text style={styles.title}>{isAnime ? 'Onde assistir' : 'Onde ler'}</Text>
          <Text style={styles.muted}>Sites oficiais informados pela AniList.</Text>

          <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ gap: 8, paddingTop: 8 }}>
            {titulo.trailerUrl && (
              <Pressable style={[styles.option, styles.trailer]} onPress={() => abrir(titulo.trailerUrl as string)}>
                <View style={[styles.icon, { backgroundColor: colors.accent }]}>
                  <Ionicons name="play" size={18} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.site}>Trailer</Text>
                  <Text style={styles.muted}>Vídeo oficial de divulgação</Text>
                </View>
                <Ionicons name="open-outline" size={18} color={colors.textMuted} />
              </Pressable>
            )}

            {links.map((l) => (
              <Pressable key={`${l.site}|${l.language}`} style={styles.option} onPress={() => abrir(l.url)}>
                <View style={[styles.icon, { backgroundColor: l.color || colors.surfaceAlt }]}>
                  <Ionicons name={isAnime ? 'tv' : 'book'} size={18} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.site}>{l.site}</Text>
                  {l.language && <Text style={styles.muted}>{IDIOMA_PT[l.language] ?? l.language}</Text>}
                </View>
                <Ionicons name="open-outline" size={18} color={colors.textMuted} />
              </Pressable>
            ))}

            {links.length === 0 && !titulo.trailerUrl && (
              <Text style={[styles.muted, { paddingVertical: 16, textAlign: 'center' }]}>
                Ainda não há sites oficiais cadastrados para este título.
              </Text>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 20,
    gap: 2,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  muted: { color: colors.textMuted, fontSize: 13 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 12,
  },
  trailer: { borderWidth: 1, borderColor: colors.accent },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  site: { color: colors.text, fontSize: 15, fontWeight: '700' },
});
