export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'haowjy-theme'

export function getStoredTheme(): Theme | null {
  if (typeof localStorage === 'undefined') return null
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : null
}

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getPreferredTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

export function persistTheme(theme: Theme): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function initializeTheme(): Theme {
  const theme = getPreferredTheme()
  applyTheme(theme)
  return theme
}
