import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { ThemeContext } from '@/components/layout/ThemeContext'
import {
  applyTheme,
  getPreferredTheme,
  persistTheme,
  type Theme,
} from '@/lib/theme'

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const preferredTheme = getPreferredTheme()
    applyTheme(preferredTheme)
    if (preferredTheme === 'light') return
    const t = window.setTimeout(() => setTheme(preferredTheme), 0)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    applyTheme(theme)
    persistTheme(theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
