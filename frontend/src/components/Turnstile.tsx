import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"

import { TURNSTILE_SITE_KEY } from "@/settings"

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "expired-callback": () => void
          "error-callback": () => void
        },
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (scriptPromise == null) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = SCRIPT_SRC
      script.async = true
      script.onload = () => {
        resolve()
      }
      script.onerror = () => {
        scriptPromise = null
        reject(new Error("failed to load turnstile"))
      }
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}

export type TurnstileHandle = { reset: () => void }

export const Turnstile = forwardRef<
  TurnstileHandle,
  { onToken: (token: string | null) => void }
>(function Turnstile({ onToken }, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current != null) {
        window.turnstile?.reset(widgetId.current)
        onTokenRef.current(null)
      }
    },
  }))

  useEffect(() => {
    let cancelled = false
    void loadScript().then(() => {
      if (cancelled || containerRef.current == null || !window.turnstile) {
        return
      }
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => {
          onTokenRef.current(token)
        },
        "expired-callback": () => {
          onTokenRef.current(null)
        },
        "error-callback": () => {
          onTokenRef.current(null)
        },
      })
    })
    return () => {
      cancelled = true
      if (widgetId.current != null) {
        window.turnstile?.remove(widgetId.current)
        widgetId.current = null
      }
    }
  }, [])

  return <div ref={containerRef} />
})
