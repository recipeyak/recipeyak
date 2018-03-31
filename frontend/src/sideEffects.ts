export const setDarkModeClass = (isDarkMode: boolean) => {
  if (isDarkMode) {
    document.querySelector('html').classList.add('dark-mode')
  } else {
    document.querySelector('html').classList.remove('dark-mode')
  }
}
