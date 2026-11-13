import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { colors } from '../../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={icon} color={color} size={size} />
  ),
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen name="index" options={tab('Início', 'home')} />
      <Tabs.Screen name="mangas" options={tab('Mangás', 'book')} />
      <Tabs.Screen name="favoritos" options={tab('Favoritos', 'heart')} />
      <Tabs.Screen name="mais" options={tab('Mais', 'menu')} />
    </Tabs>
  );
}
