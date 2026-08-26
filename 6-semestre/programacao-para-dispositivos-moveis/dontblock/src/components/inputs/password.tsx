import { TextInputProps } from "react-native";
import { InputText } from "./text";

interface InputTextProps extends TextInputProps {
    label: string;
    error?: string;
}

export const InputPassword: React.FC<InputTextProps> = ({
    label,
    error,
    style,
    ...rest
}) => {

    return <InputText
        label={label}
        error={error}
        style={style}
        secureTextEntry
        {...rest}
    />;
};