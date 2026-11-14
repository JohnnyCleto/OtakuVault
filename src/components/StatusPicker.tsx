import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Kind } from '../services/anilist';
import { STATUS_COLOR, STATUS_ORDER, StatusKey, statusLabel } from '../storage/lista';
import { colors } from '../theme';

export default function StatusPicker({
  visible,
  kind,
  current,
  onClose,
  onSelect,
}: {
  visible: boolean;
  kind: Kind;
  current: StatusKey | null;
  onClose: () => void;
  onSelect: (status: StatusKey | null) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
          <Text style={styles.title}>Minha lista</Text>

          {STATUS_ORDER.map((s) => (
            <Pressable key={s} style={styles.option} onPress={() => onSelect(s)}>
              <View style={[styles.dot, { backgroundColor: STATUS_COLOR[s] }]} />
              <Text style={styles.optionText}>{statusLabel(s, kind)}</Text>
              {current === s && <Ionicons name="checkmark" size={22} color={colors.text} />}
            </Pressable>
          ))}

          {current && (
            <Pressable style={styles.option} onPress={() => onSelect(null)}>
              <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
              <Text style={[styles.optionText, { color: colors.textMuted }]}>Remover da lista</Text>
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    gap: 4,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  optionText: { color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 },
});
