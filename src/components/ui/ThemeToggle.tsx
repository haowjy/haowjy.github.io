import { useTheme } from '@/components/layout/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <span data-active={theme === 'light'}>LIGHT</span>
      <span aria-hidden="true"> · </span>
      <span data-active={theme === 'dark'}>DARK</span>
    </button>
  )
}
