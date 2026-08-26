import { useThemeStore } from "@/stores/themeStore";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

export const useInputStyles = () => {
    const { theme } = useThemeStore();

    const styles = useMemo(() => StyleSheet.create({
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
        container: {
            marginBottom: 16,
            width: '100%',
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 6,
        },
        inputDefault: {
            borderColor: theme.colors.border,
        },
        inputFocused: {
            borderColor: theme.colors.primary,
        },
        inputError: {
            borderColor: theme.colors.error,
        },
        footer: {
            alignItems: 'flex-end',
            marginTop: 4,
        },
        errorText: {
            fontSize: 12,
            color: theme.colors.error,
            fontWeight: '500',
        },
    }), [theme]);

    return styles;
}