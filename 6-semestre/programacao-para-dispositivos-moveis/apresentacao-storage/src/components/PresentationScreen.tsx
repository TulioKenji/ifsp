// components/PresentationScreen.tsx

import {
    ReactNode,
} from 'react';

import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type Props = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PresentationScreen({
  children,
  eyebrow,
  title,
  description,
}: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {eyebrow && (
          <Text style={styles.eyebrow}>
            {eyebrow}
          </Text>
        )}

        <Text style={styles.title}>
          {title}
        </Text>

        {description && (
          <Text style={styles.description}>
            {description}
          </Text>
        )}

        <View style={styles.body}>
          {children}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 60,
    paddingVertical: 50,
  },

  content: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },

  eyebrow: {
    marginBottom: 12,

    color: '#61DAFB',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '800',
  },

  description: {
    maxWidth: 800,
    marginTop: 16,

    color: '#9CA8BC',
    fontSize: 18,
    lineHeight: 28,
  },

  body: {
    marginTop: 42,
  },
});