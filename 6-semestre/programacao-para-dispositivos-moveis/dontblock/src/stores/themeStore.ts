import { create } from 'zustand';

interface Theme {
  colors: {
    background: string;
    surface: string;
    surfaceSecondary: string;

    primary: string;
    primaryDark: string;

    text: string;
    textLight: string;
    textSecondary: string;
    textTertiary: string;

    border: string;
    divider: string;

    success: string;
    warning: string;
    error: string;
    info: string;

    placeholder: string;

    card: string;
    shadow: string;
  };

  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };

  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };

  typography: {
    title: number;
    subtitle: number;
    body: number;
    caption: number;
    small: number;
  };
}

type Schema = 'light' | 'dark'

interface ThemeState {
    theme: Theme;
    changeTheme: (change: Schema) => void
}


const lightTheme: Theme = {
  colors: {
    background: "#F5F5F7",
    surface: "#FFFFFF",
    surfaceSecondary: "#F0F2F5",

    primary: "#4F46E5",
    primaryDark: "#3730A3",

    text: "#111827",
    textLight: "#F9FAFB",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",

    border: "#E5E7EB",
    divider: "#ECECEC",

    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    placeholder: "#A1A1AA",

    card: "#FFFFFF",
    shadow: "rgba(0,0,0,0.08)",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    full: 999,
  },

  typography: {
    title: 28,
    subtitle: 20,
    body: 16,
    caption: 14,
    small: 12,
  },
};

const darkTheme: Theme = {
  colors: {
    background: "#0F1115",
    surface: "#181A20",
    surfaceSecondary: "#23262F",

    primary: "#7C83FF",
    primaryDark: "#5D65F5",

    text: "#F8FAFC",
    textLight: "#F9FAFB",
    textSecondary: "#B4BCC8",
    textTertiary: "#7B8494",

    border: "#2E3440",
    divider: "#252A34",

    success: "#4ADE80",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#60A5FA",

    placeholder: "#6B7280",

    card: "#1D2028",
    shadow: "rgba(0,0,0,0.45)",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    full: 999,
  },

  typography: {
    title: 28,
    subtitle: 20,
    body: 16,
    caption: 14,
    small: 12,
  },
};

const themes: Record<Schema, Theme> = {
    light: lightTheme,
    dark: darkTheme
}

export const useThemeStore = create<ThemeState>((set, get)=>({
    theme: lightTheme,
    changeTheme: (change) => {
        set({
            theme: themes[change]
        })
    }
}))