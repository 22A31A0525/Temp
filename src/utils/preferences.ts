export type Theme = 'light' | 'dark'

export function getSavedTheme(): Theme {
  return localStorage.getItem('dashboard-theme') === 'dark' ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  localStorage.setItem('dashboard-theme', theme)
}
