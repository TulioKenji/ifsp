import { useThemeStore } from "@/stores/themeStore";
import { useMemo } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const notes = [
  {
    id: "1",
    emoji: "💡",
    title: "Ideias para o aplicativo",
    content: "Criar splash screen, login e sincronização.",
    date: "Hoje • 18:42",
  },
  {
    id: "2",
    emoji: "🛒",
    title: "Lista do mercado",
    content: "Café, pão, leite, ovos e manteiga.",
    date: "Ontem",
  },
  {
    id: "3",
    emoji: "🎯",
    title: "Metas da semana",
    content: "Finalizar o projeto e estudar React Native.",
    date: "Segunda",
  },
];

export default function HomeScreen() {
  const { theme } = useThemeStore();

  const styles = useMemo(()=>StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
    },

    header: {
      marginTop: theme.spacing.lg,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    greeting: {
      color: theme.colors.text,
      fontSize: theme.typography.title,
      fontWeight: "700",
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
      justifyContent: "center",
      alignItems: "center",
    },

    search: {
      marginTop: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.full,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      height: 52,
    },

    input: {
      flex: 1,
      marginLeft: 10,
      color: theme.colors.text,
      fontSize: theme.typography.body,
    },

    categories: {
      flexDirection: "row",
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      alignItems: "center",
    },

    category: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: theme.radius.full,
      marginRight: 10,
    },

    categoryText: {
      color: theme.colors.text,
      fontWeight: "600",
    },

    addCategory: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },

    section: {
      color: theme.colors.text,
      fontSize: theme.typography.subtitle,
      fontWeight: "700",
      marginBottom: theme.spacing.md,
    },

    card: {
      flexDirection: "row",
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,

      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },

      elevation: 3,
    },

    cardEmoji: {
      fontSize: 28,
      marginRight: 15,
    },

    cardTitle: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: "700",
    },

    cardContent: {
      color: theme.colors.textSecondary,
      marginTop: 5,
      lineHeight: 20,
    },

    cardDate: {
      marginTop: 12,
      color: theme.colors.textTertiary,
      fontSize: 12,
    },

    fab: {
      position: "absolute",
      bottom: 30,
      right: 25,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",

      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
  }), [theme])

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Bem vindo</Text>
                <Text style={styles.subtitle}>
                  Suas ideias merecem ser lembradas.
                </Text>
              </View>

              <TouchableOpacity style={styles.avatar}>
                <Text>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.search}>
              <Text>Add</Text>

              <TextInput
                placeholder="Pesquisar notas..."
                placeholderTextColor={theme.colors.placeholder}
                style={styles.input}
              />
            </View>

            <View style={styles.categories}>
              {["Todas", "Favoritas", "Trabalho", "Pessoal"].map((item) => (
                <TouchableOpacity key={item} style={styles.category}>
                  <Text style={styles.categoryText}>{item}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.addCategory}>
                <Text>Add</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.section}>Últimas notas</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardEmoji}>{item.emoji}</Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>

              <Text
                numberOfLines={2}
                style={styles.cardContent}
              >
                {item.content}
              </Text>

              <Text style={styles.cardDate}>{item.date}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab}>
        <Text>Add</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

  