import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import Toast from 'react-native-toast-message';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { PresentationHeader } from '@/components/PresentationHeader';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          header: ({ options }) => (
            <PresentationHeader
              title={options.title ?? ''}
            />
          ),

          contentStyle: {
            backgroundColor: '#0B1020',
          },

          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'React Native Storage',
          }}
        />

        <Stack.Screen
          name="mmkv"
          options={{
            title: 'MMKV',
          }}
        />

        <Stack.Screen
          name="expo-secure-store"
          options={{
            title: 'Expo Secure Store',
          }}
        />

        <Stack.Screen
          name="storages-zustand"
          options={{
            title: 'Storages + Zustand',
          }}
        />

        <Stack.Screen
          name="benchmarks"
          options={{
            title: 'Benchmarks',
          }}
        />
      </Stack>
      <Toast />
    </ThemeProvider>
  );
}