import Input from '@/components/inputs';
import { useToast } from '@/hooks/useToast';
import { parseForm } from '@/schemas/parseForm';
import { userPayloadSchema } from '@/schemas/user';
import { useThemeStore } from '@/stores/themeStore';
import { useUsersStore } from '@/stores/userStore';
import { useRouter } from 'expo-router';
import { FileExclamationPoint } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CreateAccountScreen() {
  const { theme } = useThemeStore();
  const router = useRouter();
  const { addUser } = useUsersStore();
  const { showToast } = useToast();

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ user?: string; password?: string }>({});

  const handleCreateAccount = () => {
    try {
        const parse = parseForm(userPayloadSchema, {user, password});

        if(!parse.success) {
            setErrors(parse.errors??{});
            return;
        }

        addUser({
          // id: uuidv7(),
          user,
          password
        });
        showToast('success', 'Conta criada com sucesso!');
        router.push('/');
    }catch (error) {
       showToast('error', 'Erro ao criar conta', (error as Error).message);
    }
    router.push('/');
    
  }

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
      justifyContent: 'center',
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
      <View style={styles.main}>
        <Text style={styles.title}>Don't Block</Text>
        <FileExclamationPoint size={48} color={theme.colors.primary} />
      </View>
      <View style={styles.login}>
        <Text style={styles.subtitle}>Crie uma nova conta</Text>
        <View style={styles.form}>
          <Input
            placeholder="Usuário"
            label="Usuário"
            value={user}
            onChangeText={setUser}
            error={errors.user}
            // placeholderTextColor={theme.colors.textSecondary}
            // style={styles.input}
          />
          <Input.Password
            value={password}
            onChangeText={setPassword}
            label="Senha"
            placeholder="Senha"
            error={errors.password}
            // placeholderTextColor={theme.colors.textSecondary}
            // style={styles.input}
            // secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
          <Text style={styles.buttonText}>Criar Conta</Text>
        </TouchableOpacity>
       
      </View>
    </View>
  )
}