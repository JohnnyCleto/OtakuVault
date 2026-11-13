import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../storage/auth';
import { FavoritesProvider } from '../storage/favorites';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="busca" options={{ headerShown: false }} />
          <Stack.Screen name="titulo/[id]" options={{ title: 'Detalhes' }} />
          <Stack.Screen name="categoria/[nome]" options={{ title: 'Categoria' }} />
          <Stack.Screen name="personagens/[id]" options={{ title: 'Personagens' }} />
          <Stack.Screen name="perfil" options={{ title: 'Perfil' }} />
          <Stack.Screen name="editar-perfil" options={{ title: 'Editar perfil' }} />
          <Stack.Screen name="configuracoes" options={{ title: 'Configurações' }} />
          <Stack.Screen name="login" options={{ title: 'Entrar' }} />
        </Stack>
      </FavoritesProvider>
    </AuthProvider>
  );
}
