import { useState } from 'react';
import { FlatList, ScrollView, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import Carousel from '../../components/Carousel';
import ContinueCard from '../../components/ContinueCard';
import EpisodeCard from '../../components/EpisodeCard';
import GenreChips from '../../components/GenreChips';
import HeroCarousel from '../../components/HeroCarousel';
import SectionHeader from '../../components/SectionHeader';
import TituloCard from '../../components/TituloCard';
import { useAsync } from '../../hooks/useAsync';
import { useNovidades } from '../../hooks/useNovidades';
import { openSecao } from '../../navigation';
import { getRecentlyAdded, getTopRated, getTrending, Titulo } from '../../services/anilist';
import { useLista } from '../../storage/lista';
import { colors } from '../../theme';

const SIDE = 16;
const GAP = 12;

// Sem gênero escolhido, tudo passa. Títulos sem gêneros salvos (listas antigas) também passam.
const doGenero = (t: Titulo, genre: string | null) =>
  !genre || t.genres.length === 0 || t.genres.includes(genre);

export default function InicioScreen() {
  const { width } = useWindowDimensions();
  const [genre, setGenre] = useState<string | null>(null);
  const g = genre ?? undefined;

  const trending = useAsync(() => getTrending('ANIME', 10, g), [genre]);
  const recent = useAsync(() => getRecentlyAdded('ANIME', 12, g), [genre]);
  const top = useAsync(() => getTopRated('ANIME', 12, g), [genre]);
  const { state: novos, meus, outros } = useNovidades();
  const { entries } = useLista();

  const continuar = entries
    .filter((e) => e.status === 'WATCHING' && doGenero(e.titulo, genre))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  // Episódios dos títulos que o usuário acompanha aparecem primeiro.
  const episodios = [...meus, ...outros].filter((e) => doGenero(e.titulo, genre)).slice(0, 12);
  const meusNoFiltro = meus.filter((e) => doGenero(e.titulo, genre)).length;

  const contentW = Math.min(width, 900) - SIDE * 2;
  const continueW = Math.min(contentW - 24, 520);
  const episodeW = Math.min((contentW - GAP) / 2, 260);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 24 }}>
      <GenreChips value={genre} onChange={setGenre} />

      <HeroCarousel key={genre ?? "todos"} title="Em alta" state={trending} />

      {continuar.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <SectionHeader title="Continue assistindo" onSeeAll={() => router.push('/minha-lista')} />
          <FlatList
            data={continuar}
            horizontal
            keyExtractor={(e) => String(e.titulo.id)}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={{ paddingHorizontal: SIDE }}
            ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
            renderItem={({ item }) => (
              <ContinueCard titulo={item.titulo} progress={item.progress ?? 0} width={continueW} />
            )}
          />
        </View>
      )}

      <Carousel
        title="Novos episódios"
        badge={meusNoFiltro > 0 ? `+${meusNoFiltro}` : undefined}
        onSeeAll={() => router.push('/notificacoes')}
        state={{ ...novos, data: novos.data ? episodios : null }}
        keyOf={(e) => String(e.titulo.id)}
        renderItem={(e) => <EpisodeCard titulo={e.titulo} episode={e.episode} width={episodeW} />}
      />

      <Carousel
        title="Recém adicionados"
        onSeeAll={() => openSecao('recentes', genre)}
        state={recent}
        keyOf={(t) => String(t.id)}
        renderItem={(t) => <TituloCard titulo={t} />}
      />

      <Carousel
        title="Mais bem avaliados"
        onSeeAll={() => openSecao('melhores', genre)}
        state={top}
        keyOf={(t) => String(t.id)}
        renderItem={(t) => <TituloCard titulo={t} />}
      />
    </ScrollView>
  );
}
