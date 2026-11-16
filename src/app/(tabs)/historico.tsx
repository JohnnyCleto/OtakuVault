import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TituloRow from '../../components/TituloRow';
import { useHistorico } from '../../storage/historico';
import { confirmar } from '../../utils/confirm';
import { colors } from '../../theme';

function quando(iso: string): string {
  const d = new Date(iso);
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === hoje.toDateString()) return `Hoje, ${hora}`;
  if (d.toDateString() === ontem.toDateString()) return `Ontem, ${hora}`;
  return d.toLocaleDateString('pt-BR');
}

export default function HistoricoScreen() {
  const { visitas, remover, clear } = useHistorico();

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={visitas}
      keyExtractor={(v) => String(v.titulo.id)}
      ListHeaderComponent={
        visitas.length > 0 ? (
          <View style={styles.header}>
            <Text style={styles.title}>Vistos recentemente</Text>
            <Pressable
              hitSlop={8}
              style={styles.clear}
              onPress={async () => {
                if (await confirmar('Limpar histórico', 'Apagar todos os títulos do histórico?', 'Limpar')) clear();
              }}
            >
              <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
              <Text style={styles.clearText}>Limpar</Text>
            </Pressable>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhum título visto ainda</Text>
          <Text style={styles.emptyText}>Os animes e mangás que você abrir vão aparecer aqui.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TituloRow
          titulo={item.titulo}
          extraTag={{ label: quando(item.viewedAt), color: colors.textMuted }}
          onRemove={() => remover(item.titulo.id)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  clear: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clearText: { color: colors.textMuted, fontWeight: '600' },
  empty: { alignItems: 'center', padding: 40, gap: 10 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  emptyText: { color: colors.textMuted, textAlign: 'center' },
});
