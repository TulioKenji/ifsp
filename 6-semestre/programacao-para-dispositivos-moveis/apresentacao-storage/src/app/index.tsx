// app/(presentation)/index.tsx

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PresentationScreen } from '@/components/PresentationScreen';

export default function PresentationHome() {
  return (
    <PresentationScreen
      eyebrow="REACT NATIVE"
      title="Storage no React Native"
      description="Como armazenar, proteger e gerenciar dados localmente em aplicações React Native."
    >
      <View style={styles.grid}>
        <Card
          number="01"
          title="MMKV"
          description="Storage rápido baseado em chave e valor."
        />

        <Card
          number="02"
          title="Secure Store"
          description="Armazenamento seguro para dados sensíveis."
        />

        <Card
          number="03"
          title="Zustand"
          description="Estado global persistido localmente."
        />

        <Card
          number="04"
          title="Benchmarks"
          description="Comparando performance e casos de uso."
        />
      </View>
    </PresentationScreen>
  );
}

function Card({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.number}>{number}</Text>

      <Text style={styles.cardTitle}>
        {title}
      </Text>

      <Text style={styles.cardDescription}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },

  card: {
    width: 250,
    minHeight: 150,

    padding: 24,

    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#27324A',

    backgroundColor: '#11182A',
  },

  number: {
    color: '#61DAFB',
    fontSize: 12,
    fontWeight: '800',
  },

  cardTitle: {
    marginTop: 18,

    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  cardDescription: {
    marginTop: 8,

    color: '#8995AA',
    fontSize: 14,
    lineHeight: 21,
  },
});