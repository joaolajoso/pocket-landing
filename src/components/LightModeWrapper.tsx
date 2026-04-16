import { useEffect, useRef, ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface LightModeWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that forces light mode for public pages.
 * Restores the user's previous theme preference on unmount.
 */
export const LightModeWrapper = ({ children }: LightModeWrapperProps) => {
  const { theme, setTheme } = useTheme();
  const previousTheme = useRef(theme);

  useEffect(() => {
    // Capture the current theme before overriding
    previousTheme.current = theme;
  }, []); // only on mount

  useEffect(() => {
    // Force light mode
    setTheme('light');

    return () => {
      // Restore previous theme on unmount
      setTheme(previousTheme.current);
    };
  }, [setTheme]);

  return <>{children}</>;
};
