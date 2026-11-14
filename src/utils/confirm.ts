import { Alert, Platform } from 'react-native';

export function confirmar(title: string, message: string, confirmLabel = 'Confirmar'): Promise<boolean> {
  if (Platform.OS === 'web') {
    const ok = (globalThis as any).confirm?.(`${title}\n\n${message}`);
    return Promise.resolve(Boolean(ok));
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}
