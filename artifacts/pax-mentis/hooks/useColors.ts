import colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

/**
 * Returns the design tokens for the current color scheme.
 * Reads from ThemeContext so user preference (system/light/dark) is respected.
 */
export function useColors() {
  const { colorScheme } = useTheme();
  const palette =
    colorScheme === "dark" && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;
  return { ...palette, radius: colors.radius, shape: colors.shape };
}
