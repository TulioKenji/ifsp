import AppTabs from '@/app/_tabs';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Loading } from '@/components/loading';
import { useLoadingStore } from '@/stores/loadingStore';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLoading } = useLoadingStore();

  return (
    <SafeAreaProvider>
      <Loading isLoading={isLoading} />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
        <Toast />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
