// app/(presentation)/storages-zustand.tsx

import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { PresentationScreen } from '@/components/PresentationScreen';

export default function StoragesZustandScreen() {
  return (
    <PresentationScreen
      eyebrow="03 · STATE MANAGEMENT"
      title="Storages + Zustand"
      description="Persistindo estado global da aplicação sem transformar o storage em uma camada de negócio."
    >
      <View style={styles.architecture}>
        <Box
          title="React Component"
          description="UI"
        />

        <Text style={styles.arrow}>→</Text>

        <Box
          title="Zustand"
          description="Global State"
        />

        <Text style={styles.arrow}>→</Text>

        <Box
          title="Storage"
          description="Persistence"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Separação de responsabilidades
        </Text>

        <Text style={styles.text}>
          Zustand gerencia o estado da aplicação.
          {'\n\n'}
          O storage cuida da persistência.
          {'\n\n'}
          A combinação dos dois permite que o estado
          seja restaurado quando o aplicativo for aberto novamente.
        </Text>
      </View>
    </PresentationScreen>
  );
}

function Box({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.box}>
      <Text style={styles.boxTitle}>{title}</Text>
      <Text style={styles.boxDescription}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  architecture: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },

  box: {
    width: 210,
    padding: 24,

    borderRadius: 16,
    backgroundColor: '#11182A',
    borderWidth: 1,
    borderColor: '#27324A',
  },

  boxTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  boxDescription: {
    marginTop: 6,
    color: '#8995AA',
    fontSize: 14,
  },

  arrow: {
    color: '#61DAFB',
    fontSize: 28,
    fontWeight: '300',
  },

  card: {
    marginTop: 30,
    padding: 28,

    borderRadius: 18,
    backgroundColor: '#11182A',
    borderWidth: 1,
    borderColor: '#27324A',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  text: {
    marginTop: 16,

    color: '#A6B0C0',
    fontSize: 16,
    lineHeight: 26,
  },
});