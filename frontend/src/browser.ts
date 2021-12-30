export function isMobile(): boolean {
  // via: https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_device_detection
  return typeof window !== "undefined" && /mobi/i.test(navigator.userAgent)
}
