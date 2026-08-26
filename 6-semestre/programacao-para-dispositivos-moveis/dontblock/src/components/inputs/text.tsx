import { useThemeStore } from "@/stores/themeStore";
import { useState } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { useInputStyles } from "./useInputStyles";

interface InputTextProps extends TextInputProps {
    label: string;
    error?: string;
}

export const InputText: React.FC<InputTextProps> = ({
    label,
    error,
    style,
    ...rest
}) => {
    // Verifica se existe erro e se não é uma string vazia
    const hasError = !!error && error.length > 0;
    const { theme } = useThemeStore();
    const styles = useInputStyles();
    const [isFocused, setIsFocused] = useState(false);

    const outlineColor = isFocused && !hasError ? theme.colors.primary : hasError ? theme.colors.error : theme.colors.border;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <TextInput
                style={[
                    styles.input,
                    { borderColor: outlineColor }, // Define a cor da borda com base no estado
                    style, // Permite sobrescrever estilos externamente se necessário
                ]}
                placeholderTextColor={theme.colors.textSecondary}
                onFocus={() => {
                    setIsFocused(true);
                }}
                onBlur={() => {
                    setIsFocused(false);
                }}
                {...rest}
            />

            {hasError && (
                <View style={styles.footer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};