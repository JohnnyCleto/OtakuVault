import type { StyleProp, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';

// Florzinha decorativa (pétalas redondas). Usada no lugar do ícone "flower"
// do Ionicons, que parecia uma engrenagem e confundia com o botão de configurações.
export default function Sakura({
  size = 24,
  opacity = 1,
  style,
}: {
  size?: number;
  opacity?: number;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <MaterialCommunityIcons
      name="flower"
      size={size}
      color={colors.accent}
      style={[{ opacity }, style]}
      pointerEvents="none"
    />
  );
}
