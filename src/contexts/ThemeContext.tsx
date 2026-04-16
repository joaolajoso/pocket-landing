import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react"
import { supabase } from "@/integrations/supabase/client"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme | null
    const isDashboard = window.location.pathname === "/dashboard"
    return stored || (isDashboard ? "dark" : "light")
  })
  const skipDbSync = useRef(false)
  const userIdRef = useRef<string | null>(null)

  // Load theme from DB on auth — use onAuthStateChange instead of getUser()
  useEffect(() => {
    const loadFromDb = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('theme_preference')
        .eq('id', userId)
        .single()
      if (data?.theme_preference && (data.theme_preference === 'light' || data.theme_preference === 'dark')) {
        skipDbSync.current = true
        setThemeState(data.theme_preference as Theme)
        localStorage.setItem("theme", data.theme_preference)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const userId = session?.user?.id
      userIdRef.current = userId || null
      if (event === 'SIGNED_IN' && userId) {
        loadFromDb(userId)
      } else if (event === 'INITIAL_SESSION' && userId) {
        loadFromDb(userId)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  // Persist to DB when user toggles
  const saveToDb = useCallback(async (newTheme: Theme) => {
    const userId = userIdRef.current
    if (!userId) return
    await supabase.from('profiles').update({ theme_preference: newTheme }).eq('id', userId)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    skipDbSync.current = true
    setThemeState(t)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "light" ? "dark" : "light"
      saveToDb(next)
      return next
    })
  }, [saveToDb])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
