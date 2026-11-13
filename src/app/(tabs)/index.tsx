import { ScrollView } from 'react-native';
import Carousel from '../../components/Carousel';
import HeroCarousel from '../../components/HeroCarousel';
import TituloCard from '../../components/TituloCard';
import WideCard from '../../components/WideCard';
import { useAsync } from '../../hooks/useAsync';
import { getNewEpisodes, getRecentlyAdded, getTopRated, getTrending } from '../../services/anilist';
import { colors } from '../../theme';

export default function InicioScreen() {
  const trending = useAsync(() => getTrending('ANIME'), []);
  const episodes = useAsync(() => getNewEpisodes(12), []);
  const recent = useAsync(() => getRecentlyAdded('ANIME'), []);
  const top = useAsync(() => getTopRated('ANIME'), []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingVertical: 12 }}>
      <HeroCarousel title="Em alta" state={trending} />
      <Carousel
        title="Novos episódios"
        state={episodes}
        keyOf={(e) => String(e.titulo.id)}
        renderItem={(e) => <WideCard titulo={e.titulo} subtitle={`Episódio ${e.episode}`} />}
      />
      <Carousel
        title="Recém adicionados"
        state={recent}
        keyOf={(t) => String(t.id)}
        renderItem={(t) => <TituloCard titulo={t} />}
      />
      <Carousel
        title="Mais bem avaliados"
        state={top}
        keyOf={(t) => String(t.id)}
        renderItem={(t) => <TituloCard titulo={t} />}
      />
    </ScrollView>
  );
}
