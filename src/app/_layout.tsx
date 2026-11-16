import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../storage/auth';
import { FavoritesProvider } from '../storage/favorites';
import { HistoricoProvider } from '../storage/historico';
import { ListaProvider } from '../storage/lista';
import { SettingsProvider } from '../storage/settings';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <FavoritesProvider>
          <ListaProvider>
            <HistoricoProvider>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: colors.bg },
                  headerTintColor: colors.text,
                  contentStyle: { backgroundColor: colors.bg },
                  // Mostra só a seta de voltar, sem o nome da tela anterior
                  // (antes aparecia "(tabs)", o nome interno do grupo de abas).
                  headerBackButtonDisplayMode: 'minimal',
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Início' }} />
                <Stack.Screen name="busca" options={{ headerShown: false }} />
                <Stack.Screen name="titulo/[id]" options={{ title: 'Detalhes' }} />
                <Stack.Screen name="categoria/[nome]" options={{ title: 'Categoria' }} />
                <Stack.Screen name="personagens/[id]" options={{ title: 'Personagens' }} />
                <Stack.Screen name="perfil" options={{ title: 'Perfil' }} />
                <Stack.Screen name="editar-perfil" options={{ title: 'Editar perfil' }} />
                <Stack.Screen name="configuracoes" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="notificacoes" options={{ title: 'Novidades' }} />
                <Stack.Screen name="secao/[tipo]" options={{ title: 'Ver todos' }} />
                <Stack.Screen name="escolher-avatar" options={{ title: 'Foto de perfil' }} />
                <Stack.Screen name="sobre" options={{ title: 'Sobre' }} />
                <Stack.Screen name="ajuda" options={{ title: 'Ajuda e suporte' }} />
              </Stack>
            </HistoricoProvider>
          </ListaProvider>
        </FavoritesProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
