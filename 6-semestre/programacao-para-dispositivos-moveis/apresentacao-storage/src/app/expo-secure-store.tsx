// app/(presentation)/expo-secure-store.tsx

import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { PresentationScreen } from '@/components/PresentationScreen';

export default function ExpoSecureStoreScreen() {
  return (
    <PresentationScreen
      eyebrow="02 · SECURE STORAGE"
      title="Expo Secure Store"
      description="Armazenamento local voltado para informações que precisam de proteção adicional."
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          Ideal para dados sensíveis
        </Text>

        <View style={styles.list}>
          <Item text="Tokens de autenticação" />
          <Item text="Refresh tokens" />
          <Item text="Credenciais" />
          <Item text="Chaves e secrets" />
        </View>
      </View>

      <View style={styles.warning}>
        <Text style={styles.warningTitle}>
          IMPORTANTE
        </Text>

        <Text style={styles.warningText}>
          Nem todo dado precisa estar em um storage seguro.
          Escolha a estratégia de acordo com a sensibilidade
          e o ciclo de vida da informação.
        </Text>
      </View>
    </PresentationScreen>
  );
}

function Item({ text }: { text: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.bullet}>✓</Text>
      <Text style={styles.itemText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 30,

    borderRadius: 18,
    backgroundColor: '#11182A',
    borderWidth: 1,
    borderColor: '#27324A',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 22,
  },

  list: {
    gap: 16,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  bullet: {
    color: '#61DAFB',
    fontSize: 18,
    fontWeight: '800',
  },

  itemText: {
    color: '#B0BACB',
    fontSize: 17,
  },

  warning: {
    marginTop: 20,
    padding: 24,

    borderRadius: 14,
    backgroundColor: '#211D2B',
    borderWidth: 1,
    borderColor: '#423750',
  },

  warningTitle: {
    color: '#D7A8FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  warningText: {
    marginTop: 10,

    color: '#B8ADBF',
    fontSize: 15,
    lineHeight: 24,
  },
});