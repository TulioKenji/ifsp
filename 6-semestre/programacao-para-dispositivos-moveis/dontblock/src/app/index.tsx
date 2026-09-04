import { useToast } from '@/hooks/useToast';
import { parseForm } from '@/schemas/parseForm';
import { userPayloadSchema } from '@/schemas/user';
import { useThemeStore } from '@/stores/themeStore';
import { useUsersStore } from '@/stores/userStore';
import { Link, useRouter } from 'expo-router';
import { FileExclamationPoint, Settings } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const { theme } = useThemeStore();
  const router = useRouter();
  const { showToast } = useToast();

  const { users } = useUsersStore();

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{ user?: string; password?: string }>({});

  const handleLogin = () => {
    const parse = parseForm(userPayloadSchema, {user, password});

    if(!parse.success) {
        setErrors(parse.errors??{});
        return;
    }

    const login = users[user];
    if(login && login.password === password) {
        showToast('success', 'Login realizado com sucesso!');
        router.push('/home');
        return;
    }

    showToast('error', 'Usuário ou senha incorretos!');

    // router.push('/home');
  }

  const handleCreateAccount = () => {
    router.push('/create-account');
  }

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  }

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
    },

    header: {
      marginTop: theme.spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'flex-start',
    },

    greeting: {
      color: theme.colors.text,
      fontSize: theme.typography.title,
      fontWeight: '700',
    },

    main: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.md,
    },

    title: {
      color: theme.colors.primary,
      fontSize: theme.typography.title,
      fontWeight: '700',
      textAlign: 'center',
    },

    subtitle: {
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontSize: theme.typography.caption,
      textAlign: 'center',
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
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.full,
      paddingVertical: 12,
      alignItems: 'center',
    },

    buttonText: {
      color: theme.colors.textLight,
      fontSize: theme.typography.body,
      fontWeight: '600',
    },

    login: {
      alignContent: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    form: {
      gap: theme.spacing.sm,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      paddingVertical: 12,
      paddingHorizontal: 16,
      color: theme.colors.text,
      fontSize: theme.typography.body,
    },
    forgotPassword: {
      color: theme.colors.primary,
      fontSize: theme.typography.caption,
      textAlign: 'right',
    },
    newAccount: {
      paddingHorizontal: '20%',
      marginTop: theme.spacing.lg,
      gap: theme.spacing.sm,
      textAlign: 'center',
    },
  }), [theme]);



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Settings size={24} color={theme.colors.text} />
      </View>
      <View style={styles.main}>
        <Text style={styles.title}>Don't Block</Text>
        <FileExclamationPoint size={48} color={theme.colors.primary} />
      </View>
      <View style={styles.login}>
        <Text style={styles.subtitle}>Faça login para continuar</Text>
        <View style={styles.form}>
          <TextInput
            placeholder="Usuário"
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
            value={user}
            onChangeText={setUser}
          />
          <TextInput
            placeholder="Senha"
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <Link style={styles.forgotPassword} href="/home">
          Esqueceu a senha?
        </Link>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <View style={styles.newAccount}>
          <Text style={styles.subtitle}>Não tem uma conta?</Text>
          <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
            <Text style={styles.buttonText}>Criar Conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}