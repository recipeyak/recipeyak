/// <reference types="vitest" />
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path"
import { faviconsPlugin } from "@darkobits/vite-plugin-favicons"
import { visualizer } from "rollup-plugin-visualizer"

const logoSrc = {
  source: "./src/static/images/logo/recipeyak-logo.svg",
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },
  server: {
    headers: {
      "Content-Security-Policy":
        "default-src 'self' https://*.sentry.io  https://*.algolia.net https://recipeyak-production.s3.amazonaws.com https://recipeyak.imgix.net https://*.ably.io https://*.ably-realtime.com wss://*.ably.io wss://*.ably-realtime.com https://images-cdn.recipeyak.com; img-src * 'self' data: blob:; script-src 'self' 'sha256-Z2/iFzh9VMlVkEOar1f/oSHWwQk3ve1qk/C2WdsC4Xk=' 'sha256-pJgk69XM8G5ckMe2LM23W3PiOkykA9VBYDdJu59aWJk='; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; report-uri https://sentry.io/api/250295/csp-report/?sentry_key=3b11e5eed068478390e1e8f01e2190a9",
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
