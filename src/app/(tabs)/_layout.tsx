import type { ComponentProps } from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { colors } from '../../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Ícone cheio quando a aba está ativa, contorno quando inativa,
// e um traço rosa embaixo do nome da aba ativa.
const tab = (title: string, icon: IconName, iconOutline: IconName) => ({
  title,
  tabBarIcon: ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={focused ? icon : iconOutline} color={color as string} size={24} />
  ),
  tabBarLabel: ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <View style={styles.labelBox}>
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.indicator, focused && styles.indicatorActive]} />
    </View>
  ),
});

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: [styles.bar, { height: 68 + insets.bottom, paddingBottom: insets.bottom + 6 }],
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarBackground: () => <View style={styles.bg} />,
      }}
    >
      <Tabs.Screen name="index" options={tab('Início', 'home', 'home-outline')} />
      <Tabs.Screen name="mangas" options={tab('Mangás', 'book', 'book-outline')} />
      <Tabs.Screen name="favoritos" options={tab('Favoritos', 'heart', 'heart-outline')} />
      <Tabs.Screen name="minha-lista" options={tab('Minha Lista', 'list', 'list-outline')} />
      <Tabs.Screen name="historico" options={tab('Histórico', 'time', 'time-outline')} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.bg,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  bg: { flex: 1, backgroundColor: colors.bg },
  labelBox: { alignItems: 'center', gap: 4, marginTop: 2 },
  label: { fontSize: 12, fontWeight: '600' },
  indicator: { height: 3, width: 36, borderRadius: 2, backgroundColor: 'transparent' },
  indicatorActive: { backgroundColor: colors.accent },
});
