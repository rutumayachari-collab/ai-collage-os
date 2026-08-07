import { useTheme } from "../contexts/ThemeContext";

export function useThemeMode() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return { theme, setTheme, resolvedTheme };
}
