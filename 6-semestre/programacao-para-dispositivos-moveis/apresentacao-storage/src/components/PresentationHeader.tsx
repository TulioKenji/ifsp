// components/PresentationHeader.tsx

import { router, usePathname } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const pages = [
  {
    route: '/',
    title: 'React Native Storage',
  },
  {
    route: '/mmkv',
    title: 'MMKV',
  },
  {
    route: '/expo-secure-store',
    title: 'Expo Secure Store',
  },
  {
    route: '/storages-zustand',
    title: 'Storages + Zustand',
  },
  {
    route: '/benchmarks',
    title: 'Benchmarks',
  },
];

type Props = {
  title: string;
};

export function PresentationHeader({ title }: Props) {
  const pathname = usePathname();

  const currentIndex = pages.findIndex(
    (page) =>
      pathname === page.route ||
      pathname.endsWith(page.route.replace('/(presentation)', ''))
  );

  const index = currentIndex === -1 ? 0 : currentIndex;

  const hasPrevious = index > 0;
  const hasNext = index < pages.length - 1;

  function goPrevious() {
    if (!hasPrevious) return;

    router.replace(pages[index - 1].route as never);
  }

  function goNext() {
    if (!hasNext) return;

    router.replace(pages[index + 1].route as never);
  }

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>RN</Text>
        </View>

        <View>
          <Text style={styles.eyebrow}>REACT NATIVE</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <View style={styles.navigation}>
        <Pressable
          disabled={!hasPrevious}
          onPress={goPrevious}
          style={[
            styles.button,
            !hasPrevious && styles.buttonDisabled,
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              !hasPrevious && styles.buttonTextDisabled,
            ]}
          >
            ← Voltar
          </Text>
        </Pressable>

        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {index + 1} / {pages.length}
          </Text>
        </View>

        <Pressable
          disabled={!hasNext}
          onPress={goNext}
          style={[
            styles.button,
            !hasNext && styles.buttonDisabled,
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              !hasNext && styles.buttonTextDisabled,
            ]}
          >
            Avançar →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 82,
    paddingHorizontal: 32,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: '#11182A',
    borderBottomWidth: 1,
    borderBottomColor: '#27324A',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#61DAFB',
  },

  logoText: {
    color: '#0B1020',
    fontSize: 16,
    fontWeight: '900',
  },

  eyebrow: {
    color: '#61DAFB',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  title: {
    marginTop: 2,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  button: {
    paddingHorizontal: 16,
    paddingVertical: 9,

    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#33415F',

    backgroundColor: '#182239',
  },

  buttonDisabled: {
    opacity: 0.35,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  buttonTextDisabled: {
    color: '#8B95A9',
  },

  counter: {
    minWidth: 50,
    alignItems: 'center',
  },

  counterText: {
    color: '#8B95A9',
    fontSize: 12,
    fontWeight: '600',
  },
});