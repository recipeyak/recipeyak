export function isMobile(): boolean {
  // via: https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_device_detection
  return /mobi/i.test(navigator.userAgent)
}
export function isV8Browser(): boolean {
  // via: https://stackoverflow.com/a/20866141
  return window.Intl && "v8BreakIterator" in Intl
}
