export const colors = {
  // Identidade principal
  primary: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D",
    800: "#166534",
    900: "#14532D",
  },

  // Verde Hulk — destaque da marca
  hulk: {
    light: "#39FF14",
    DEFAULT: "#22E600",
    dark: "#18B800",
    darker: "#0F8F00",
  },

  // Cores de interface
  background: {
    DEFAULT: "#F8FAF9",
    subtle: "#F1F5F2",
    dark: "#0A0F0B",
  },

  surface: {
    DEFAULT: "#FFFFFF",
    elevated: "#FFFFFF",
    dark: "#111813",
    darker: "#0D120F",
  },

  // Texto
  text: {
    primary: "#111827",
    secondary: "#4B5563",
    muted: "#6B7280",
    inverse: "#FFFFFF",
    dark: "#E5E7EB",
  },

  // Bordas
  border: {
    DEFAULT: "#E5E7EB",
    subtle: "#F0F2F1",
    strong: "#D1D5DB",
    green: "#BBF7D0",
  },

  // Estados
  success: {
    light: "#DCFCE7",
    DEFAULT: "#22C55E",
    dark: "#15803D",
  },

  warning: {
    light: "#FEF3C7",
    DEFAULT: "#F59E0B",
    dark: "#B45309",
  },

  danger: {
    light: "#FEE2E2",
    DEFAULT: "#EF4444",
    dark: "#B91C1C",
  },

  info: {
    light: "#DBEAFE",
    DEFAULT: "#3B82F6",
    dark: "#1D4ED8",
  },

  // Tech / destaque
  neon: {
    green: "#39FF14",
    cyan: "#00F5FF",
    purple: "#A855F7",
  },

  // Gradientes
  gradient: {
    brand: "linear-gradient(135deg, #39FF14 0%, #16A34A 100%)",
    dark: "linear-gradient(135deg, #0A0F0B 0%, #14532D 100%)",
    hero: "linear-gradient(135deg, #0A0F0B 0%, #166534 50%, #22E600 100%)",
  },
} as const;