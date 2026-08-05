import { useThemeStore } from '@/stores/themeStore';
import { useRouter } from 'expo-router';
import { UserIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen(){
  const { theme } = useThemeStore();
const router = useRouter();
  const handleLogin = () => {
    router.push('/home');
  }

  const styles = useMemo(()=>StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
    },

    header: {
      marginTop: theme.spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    greeting: {
      color: theme.colors.text,
      fontSize: theme.typography.title,
      fontWeight: '700',
    },

    subtitle: {
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontSize: theme.typography.caption,
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    button: {
      marginTop: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.full,
      paddingVertical: 12,
      alignItems: 'center',
    },

    buttonText: {
      color: theme.colors.text,
      fontSize: theme.typography.body,
      fontWeight: '600',
    },
  }), [theme]);
    
    

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bem-vindo</Text>
        <UserIcon size={24} color={theme.colors.text} />
        <View style={styles.avatar}>
        </View>
      </View>
      <Text style={styles.subtitle}>Faça login para continuar</Text>
      <View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
      </View>
  )
}