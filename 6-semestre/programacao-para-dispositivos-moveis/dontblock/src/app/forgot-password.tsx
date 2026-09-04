import { useToast } from "@/hooks/useToast";
import { useThemeStore } from "@/stores/themeStore";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function ForgotPasswordScreen() {
  const { theme } = useThemeStore();
  const router = useRouter();
  const { showToast } = useToast();


  return (
    <View>teste</View>
  )
}
    