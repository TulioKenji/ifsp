// app/(presentation)/mmkv.tsx

import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { PresentationScreen } from '@/components/PresentationScreen';

export default function MMKVScreen() {
  return (
    <PresentationScreen
      eyebrow="01 · KEY-VALUE STORAGE"
      title="MMKV"
      description="Uma solução de armazenamento local de alta performance baseada em chave e valor."
    >
      <View style={styles.columns}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Quando usar?
          </Text>

          <Text style={styles.text}>
            • Cache local{'\n'}
            • Preferências do usuário{'\n'}
            • Feature flags{'\n'}
            • Dados pequenos e frequentes
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Características
          </Text>

          <Text style={styles.text}>
            • Muito rápido{'\n'}
            • API simples{'\n'}
            • Persistência local{'\n'}
            • Suporte a tipos primitivos
          </Text>
        </View>
      </View>

      <View style={styles.highlight}>
        <Text style={styles.highlightLabel}>
          CONCEITO
        </Text>

        <Text style={styles.highlightText}>
          storage.set("theme", "dark")
        </Text>
      </View>
    </PresentationScreen>
  );
}

const styles = StyleSheet.create({
  columns: {
    flexDirection: 'row',
    gap: 20,
  },

  card: {
    flex: 1,
    padding: 28,

    borderRadius: 18,
    backgroundColor: '#11182A',
    borderWidth: 1,
    borderColor: '#27324A',
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 18,
  },

  text: {
    color: '#A6B0C0',
    fontSize: 16,
    lineHeight: 29,
  },

  highlight: {
    marginTop: 22,
    padding: 24,

    borderRadius: 14,
    backgroundColor: '#151F34',
    borderLeftWidth: 4,
    borderLeftColor: '#61DAFB',
  },

  highlightLabel: {
    color: '#61DAFB',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  highlightText: {
    marginTop: 10,

    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'monospace',
  },
});