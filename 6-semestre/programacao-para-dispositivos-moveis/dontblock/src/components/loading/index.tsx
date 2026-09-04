import { useThemeStore } from "@/stores/themeStore";
import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";


interface Props {
    text?: string;
    isLoading: boolean;
}

export function Loading({ text = "Carregando..." , isLoading }: Props) {
    const { theme } = useThemeStore();

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: 999,
                    elevation: 999,
                    backgroundColor: theme.colors.background,
                    justifyContent: "center",
                    alignItems: "center",
                },
                text: {
                    marginTop: theme.spacing.sm,
                    fontSize: 18,
                    color: theme.colors.text,
                },
            }),
        [theme]
    );

    if(!isLoading) {
        return null;
    }

    return (
        <View style={styles.container}>
            <ActivityIndicator
                size="large"
                color={theme.colors.primary}
            />
            <Text style={styles.text}>{text}</Text>
        </View>
    );
}