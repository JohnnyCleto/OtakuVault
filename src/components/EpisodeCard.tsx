import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { openTitulo } from '../navigation';
import { nomeExibicao, Titulo } from '../services/anilist';
import { useFavorites } from '../storage/favorites';
import { useLista } from '../storage/lista';
import { colors, radius } from '../theme';

// Card de episódio novo: imagem com selo "Novo", nome, número do episódio
// e um menu (⋮) com ações rápidas.
export default function EpisodeCard({
  titulo,
  episode,
  width,
}: {
  titulo: Titulo;
  episode: number;
  width: number;
}) {
  const insets = useSafeAreaInsets();
  const [menu, setMenu] = useState(false);
  const { isFavorite, toggle } = useFavorites();
  const { getStatus, setStatus } = useLista();
  const fav = isFavorite(titulo.id);
  const naLista = getStatus(titulo.id) != null;

  const acoes = [
    { icon: 'information-circle-outline' as const, label: 'Ver detalhes', run: () => openTitulo(titulo.id) },
    {
      icon: fav ? ('heart-dislike-outline' as const) : ('heart-outline' as const),
      label: fav ? 'Remover dos favoritos' : 'Favoritar',
      run: () => toggle(titulo),
    },
    {
      icon: naLista ? ('checkmark-circle' as const) : ('add-circle-outline' as const),
      label: naLista ? 'Já está na minha lista' : 'Marcar como assistindo',
      run: () => {
        if (!naLista) setStatus(titulo, 'WATCHING');
      },
    },
  ];

  return (
    <View style={[styles.card, { width }]}>
      <Pressable onPress={() => openTitulo(titulo.id)}>
        <Image
          source={{ uri: titulo.banner || titulo.coverLarge }}
          style={{ width, height: width * 0.56, backgroundColor: colors.surfaceAlt }}
          resizeMode="cover"
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Novo</Text>
        </View>
      </Pressable>

      <View style={styles.footer}>
        <Pressable style={{ flex: 1 }} onPress={() => openTitulo(titulo.id)}>
          <Text style={styles.title} numberOfLines={1}>
            {nomeExibicao(titulo)}
          </Text>
          <Text style={styles.sub}>Episódio {episode}</Text>
        </Pressable>
        <Pressable hitSlop={10} accessibilityLabel="Mais opções" onPress={() => setMenu(true)}>
          <Ionicons name="ellipsis-vertical" size={18} color={colors.text} />
        </Pressable>
      </View>

      <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenu(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {nomeExibicao(titulo)}
            </Text>
            {acoes.map((a) => (
              <Pressable
                key={a.label}
                style={styles.option}
                onPress={() => {
                  setMenu(false);
                  a.run();
                }}
              >
                <Ionicons name={a.icon} size={22} color={colors.text} />
                <Text style={styles.optionText}>{a.label}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10 },
  title: { color: colors.text, fontSize: 14, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 20,
    gap: 4,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  sheetTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  optionText: { color: colors.text, fontSize: 16, fontWeight: '600' },
});
