import Constants from 'expo-constants';

// Versão lida do app.json, para aparecer no menu e na tela Sobre.
export const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
