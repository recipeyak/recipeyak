export const setDarkModeClass = (isDarkMode: boolean) => {
  const el = document.querySelector('html')
  if (el == null) return
  if (isDarkMode) {
    el.classList.add('dark-mode')
  } else {
    el.classList.remove('dark-mode')
  }
}
