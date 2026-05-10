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
  const [theme, setTheme] = useState<Theme>(() => {
    const preferredTheme = getPreferredTheme()
    applyTheme(preferredTheme)
    return preferredTheme
  })

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
