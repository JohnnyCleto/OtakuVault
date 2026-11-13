import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function Placeholder({ title, todo }: { title: string; todo: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.todo}>{todo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  todo: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
});
