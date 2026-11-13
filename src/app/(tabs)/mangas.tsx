import { ScrollView } from 'react-native';
import Carousel from '../../components/Carousel';
import TituloCard from '../../components/TituloCard';
import { useAsync } from '../../hooks/useAsync';
import { getPopular, getRecentlyUpdated, getTopRated, getTrending } from '../../services/anilist';
import { colors } from '../../theme';

export default function MangasScreen() {
  const trending = useAsync(() => getTrending('MANGA'), []);
  const top = useAsync(() => getTopRated('MANGA'), []);
  const popular = useAsync(() => getPopular('MANGA'), []);
  const updated = useAsync(() => getRecentlyUpdated('MANGA'), []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingVertical: 12 }}>
      <Carousel
        title="Os mais lidos no momento"
        state={trending}
        keyOf={(t) => String(t.id)}
        renderItem={(t) => <TituloCard titulo={t} width={170} />}
      />
      <Carousel
        title="Mais bem avaliados"
        state={top}
        keyOf={(t) => String(t.id)}
        renderItem={(t) => <TituloCard titulo={t} width={130} />}
      />
      <Carousel
        title="Populares de todos os tempos"
        state={popular}
        keyOf={(t) => String(t.id)}
        renderItem={(t) => <TituloCard titulo={t} width={130} />}
      />
      <Carousel
        title="Recém atualizados"
        state={updated}
        keyOf={(t) => String(t.id)}
        renderItem={(t) => <TituloCard titulo={t} width={130} />}
      />
    </ScrollView>
  );
}
