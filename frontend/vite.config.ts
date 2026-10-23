/// <reference types="vitest" />
import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import http from "http"
import path from "path"
import { faviconsPlugin } from "@darkobits/vite-plugin-favicons"
import { visualizer } from "rollup-plugin-visualizer"

const logoSrc = {
  source: "./src/static/images/logo/recipeyak-logo.svg",
}

// Mirrors infra/nginx/recipeyak.conf: backend-rs serves these routes and
// Django is the backup, so they still work if backend-rs isn't running. Vite's
// proxy can't route on method, so this runs ahead of it.
// Keep in sync with the $api_upstream map in infra/nginx/recipeyak.conf.
const backendRsRoutes: Array<{ method: string; path: string | RegExp }> = [
  { method: "GET", path: "/api/v1/calendar/" },
  { method: "POST", path: "/api/v1/calendar/" },
  { method: "GET", path: "/api/v1/calendar/settings/" },
  { method: "PATCH", path: "/api/v1/calendar/settings/" },
  { method: "POST", path: "/api/v1/calendar/generate_link/" },
  { method: "PATCH", path: /^\/api\/v1\/calendar\/\d+\/$/ },
  { method: "DELETE", path: /^\/api\/v1\/calendar\/\d+\/$/ },
  { method: "GET", path: "/api/v1/calendars/" },
  { method: "POST", path: "/api/v1/calendars/" },
  { method: "DELETE", path: /^\/api\/v1\/calendars\/\d+\/$/ },
  { method: "POST", path: /^\/api\/v1\/calendars\/\d+\/pin\/$/ },
  { method: "POST", path: "/api/v1/upload/" },
  { method: "POST", path: /^\/api\/v1\/upload\/\d+\/complete$/ },
  { method: "POST", path: /^\/api\/v1\/recipes\/\d+\/notes\/$/ },
  { method: "PATCH", path: /^\/api\/v1\/notes\/\d+\/$/ },
  { method: "DELETE", path: /^\/api\/v1\/notes\/\d+\/$/ },
  { method: "POST", path: /^\/api\/v1\/notes\/\d+\/reactions\/$/ },
  { method: "DELETE", path: /^\/api\/v1\/reactions\/\d+\/$/ },
]

function forward(
  target: string,
  req: http.IncomingMessage,
  res: http.ServerResponse,
  body: Buffer,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proxyReq = http.request(
      `${target}${req.url}`,
      { method: req.method, headers: req.headers },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers)
        proxyRes.pipe(res)
        resolve()
      },
    )
    proxyReq.on("error", reject)
    proxyReq.end(body)
  })
}

function backendRsProxy(): Plugin {
  return {
    name: "backend-rs-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split("?")[0] ?? ""
        if (
          !backendRsRoutes.some(
            (route) =>
              route.method === req.method &&
              (typeof route.path === "string"
                ? route.path === path
                : route.path.test(path)),
          )
        ) {
          next()
          return
        }
        // buffer the body so it can be replayed to Django
        const chunks: Buffer[] = []
        for await (const chunk of req) {
          chunks.push(chunk as Buffer)
        }
        const body = Buffer.concat(chunks)
        try {
          await forward("http://127.0.0.1:8001", req, res, body)
        } catch {
          // backend-rs isn't running
          await forward("http://127.0.0.1:8000", req, res, body).catch(next)
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({}),
    backendRsProxy(),
    faviconsPlugin({
      icons: {
        favicons: logoSrc,
        appleIcon: logoSrc,
        appleStartup: logoSrc,
      },
    }),
    // This isn't super accurate size wise, but gives a rough idea
    // see: https://github.com/btd/rollup-plugin-visualizer/issues/96
    visualizer(),
  ],
  envPrefix: "FRONTEND_",
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(import.meta.dirname, "./src"),
      },
    ],
  },
  server: {
    headers: {
      "Content-Security-Policy":
        "default-src 'self' https://challenges.cloudflare.com https://*.sentry.io  https://*.algolia.net https://recipeyak-production.s3.amazonaws.com https://recipeyak.imgix.net https://*.ably.io https://*.ably-realtime.com https://*.ably.net wss://*.ably.io wss://*.ably-realtime.com wss://*.ably.net https://images-cdn.recipeyak.com; img-src * 'self' data: blob:; script-src 'self' https://challenges.cloudflare.com 'sha256-Z2/iFzh9VMlVkEOar1f/oSHWwQk3ve1qk/C2WdsC4Xk=' 'sha256-pJgk69XM8G5ckMe2LM23W3PiOkykA9VBYDdJu59aWJk='; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; report-uri https://sentry.io/api/250295/csp-report/?sentry_key=3b11e5eed068478390e1e8f01e2190a9",
    },
    proxy: {
      "/api": "http://127.0.0.1:8000/",
      "/avatar": "https://www.gravatar.com",
    },
  },
  build: {
    sourcemap: true,
  },
  test: {
    // automatically inject describe/it/test into tests
    globals: true,
    // happy-dom is supposed to be faster, but the tests failed when using it.
    environment: "jsdom",
    setupFiles: ["./vitest-setup.ts"],
  },
})
