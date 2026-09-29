// app/(presentation)/benchmarks.tsx

import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BenchRow, buildItems, runBenchmark } from '@/benchmarks/runBenchmark';
import { cartItens } from '@/constants/cartItens';

const MULTIPLIERS = [1, 10, 100];

export default function BenchmarksScreen() {
  const [multiplier, setMultiplier] = useState(10);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState('');
  const [rows, setRows] = useState<BenchRow[]>([]);

  const totalItems = cartItens.length * multiplier;

  async function handleRun() {
    setRunning(true);
    setRows([]);
    // deixa o React renderizar o loading antes de travar a thread JS
    await new Promise((r) => setTimeout(r, 50));
    try {
      const result = await runBenchmark(buildItems(multiplier), setProgress);
      setRows(result);
      console.table(result);
    } catch (e) {
      console.error('Benchmark error', e);
    } finally {
      setRunning(false);
      setProgress('');
    }
  }

  // agrupa: [group + scenario] -> linhas ordenadas do mais rápido ao mais lento
  const groups = useMemo(() => {
    const map = new Map<string, BenchRow[]>();
    rows.forEach((r) => {
      const key = `${r.group} · ${r.scenario}`;
      map.set(key, [...(map.get(key) ?? []), r]);
    });
    return [...map.entries()].map(([title, list]) => ({
      title,
      list: [...list].sort((a, b) => a.ms - b.ms),
    }));
  }, [rows]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Storage benchmark</Text>
      <Text style={styles.subtitle}>
        {totalItems} itens · mediana de 3 execuções (+1 warm-up)
      </Text>

      <View style={styles.chips}>
        {MULTIPLIERS.map((m) => (
          <Pressable
            key={m}
            disabled={running}
            onPress={() => setMultiplier(m)}
            style={[styles.chip, m === multiplier && styles.chipActive]}
          >
            <Text style={styles.chipText}>{cartItens.length * m} itens</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={handleRun}
        disabled={running}
        style={[styles.button, running && { opacity: 0.6 }]}
      >
        {running ? (
          <ActivityIndicator color="#0B1020" />
        ) : (
          <Text style={styles.buttonText}>Rodar benchmark</Text>
        )}
      </Pressable>
      {running && <Text style={styles.progress}>{progress}</Text>}

      {groups.map(({ title, list }) => (
        <View key={title} style={styles.section}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.table}>
            {list.map((r, i) => (
              <ResultRow key={r.lib} row={r} fastest={i === 0} slowest={list[list.length - 1].ms} />
            ))}
          </View>
        </View>
      ))}

      {groups.length > 0 && (
        <View style={styles.conclusion}>
          <Text style={styles.conclusionLabel}>MAIS RÁPIDO POR CENÁRIO</Text>
          {groups.map(({ title, list }) => (
            <Text key={title} style={styles.conclusionText}>
              {title}: {list[0].lib} ({list[0].ms.toFixed(2)} ms)
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function ResultRow({ row, fastest, slowest }: { row: BenchRow; fastest: boolean; slowest: number }) {
  const times = slowest > 0 ? (slowest / Math.max(row.ms, 0.001)).toFixed(1) : '1.0';
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.rowTitle}>{row.lib}</Text>
        <Text style={styles.rowDescription}>
          {fastest ? 'mais rápido' : `${(row.ms / Math.max(slowest, 0.001) * 100).toFixed(0)}% do mais lento`}
          {' · '}
          {times}x vs. pior
        </Text>
      </View>
      <Text style={[styles.rowValue, fastest && { color: '#4ADE80' }]}>
        {row.ms.toFixed(2)} ms
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B1020' },
  content: { padding: 24, paddingTop: 64, paddingBottom: 64 },

  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  subtitle: { marginTop: 4, color: '#7F8BA1', fontSize: 14 },

  chips: { flexDirection: 'row', gap: 8, marginTop: 20 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#27324A',
  },
  chipActive: { backgroundColor: '#151F34', borderColor: '#61DAFB' },
  chipText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  button: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#61DAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#0B1020', fontSize: 16, fontWeight: '800' },
  progress: { marginTop: 8, color: '#7F8BA1', fontSize: 13, textAlign: 'center' },

  section: { marginTop: 24 },
  sectionTitle: { marginBottom: 8, color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  table: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#27324A',
  },

  row: {
    minHeight: 72,
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
    padding: 24,

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
    marginTop: 10,

    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});