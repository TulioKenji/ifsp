// app/(presentation)/benchmarks.tsx

import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { PresentationScreen } from '@/components/PresentationScreen';

export default function BenchmarksScreen() {
  return (
    <PresentationScreen
      eyebrow="04 · PERFORMANCE"
      title="Benchmarks"
      description="Performance depende do tipo de operação, tamanho dos dados e frequência de acesso."
    >
      <View style={styles.table}>
        <Row
          title="MMKV"
          description="Key-value"
          value="Alta performance"
        />

        <Row
          title="Secure Store"
          description="Secure storage"
          value="Segurança"
        />

        <Row
          title="Zustand + Persist"
          description="State persistence"
          value="Produtividade"
        />
      </View>

      <View style={styles.conclusion}>
        <Text style={styles.conclusionLabel}>
          TAKEAWAY
        </Text>

        <Text style={styles.conclusionText}>
          Não existe um storage universal.
          A escolha deve partir do tipo de dado,
          requisito de segurança e padrão de acesso.
        </Text>
      </View>
    </PresentationScreen>
  );
}

function Row({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>
          {description}
        </Text>
      </View>

      <Text style={styles.rowValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#27324A',
  },

  row: {
    minHeight: 82,
    paddingHorizontal: 24,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: '#11182A',
    borderBottomWidth: 1,
    borderBottomColor: '#27324A',
  },

  rowTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  rowDescription: {
    marginTop: 4,
    color: '#7F8BA1',
    fontSize: 13,
  },

  rowValue: {
    color: '#61DAFB',
    fontSize: 14,
    fontWeight: '700',
  },

  conclusion: {
    marginTop: 24,
    padding: 28,

    borderRadius: 18,
    backgroundColor: '#151F34',
  },

  conclusionLabel: {
    color: '#61DAFB',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  conclusionText: {
    marginTop: 12,

    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '600',
  },
});