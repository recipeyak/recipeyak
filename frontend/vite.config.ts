/// <reference types="vitest" />
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import faviconsPlugin from "@darkobits/vite-plugin-favicons"
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
