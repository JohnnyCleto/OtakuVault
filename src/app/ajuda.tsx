import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

const PERGUNTAS = [
  {
    q: 'Preciso criar conta para usar o app?',
    a: 'Não. Sem conta, favoritos, lista e histórico ficam salvos como "visitante". Com conta, eles ficam separados para cada pessoa que usa o aparelho.',
  },
  {
    q: 'Como troco minha foto de perfil?',
    a: 'Abra o menu pela engrenagem e toque na sua foto. Você pode buscar qualquer personagem de anime e usar a imagem dele.',
  },
  {
    q: 'Como funciona o "Continue assistindo"?',
    a: 'Marque um título como "Assistindo" na tela de detalhes e use os botões − e + para salvar o episódio em que parou. Ele aparece no início.',
  },
  {
    q: 'O que é a bolinha rosa no sininho?',
    a: 'Indica que saiu episódio novo de algum título da sua lista ou dos seus favoritos nos últimos 3 dias.',
  },
  {
    q: 'Dá para assistir os episódios pelo app?',
    a: 'Não. O app é um catálogo: ele mostra informações, trailers e organiza o que você acompanha.',
  },
  {
    q: 'A tela fica carregando para sempre. O que faço?',
    a: 'Verifique sua internet. Em Configurações você também pode tocar em "Atualizar dados da API" para limpar o cache.',
  },
  {
    q: 'Meus dados ficam salvos onde?',
    a: 'Somente neste aparelho. Ao excluir a conta, favoritos, lista e histórico dela também são apagados.',
  },
];

export default function AjudaScreen() {
  const [aberta, setAberta] = useState<number | null>(0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Perguntas frequentes</Text>
      {PERGUNTAS.map((p, i) => {
        const open = aberta === i;
        return (
          <Pressable key={p.q} style={styles.card} onPress={() => setAberta(open ? null : i)}>
            <View style={styles.row}>
              <Text style={styles.q}>{p.q}</Text>
              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
            </View>
            {open && <Text style={styles.a}>{p.a}</Text>}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10 },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  q: { color: colors.text, fontSize: 15, fontWeight: '700', flex: 1 },
  a: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
});
