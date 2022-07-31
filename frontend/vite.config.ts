/// <reference types="vitest" />
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import faviconsPlugin from "@darkobits/vite-plugin-favicons"

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
  ],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
      {
        // this is required for the SCSS modules
        find: /^~(.*)$/,
        replacement: "$1",
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
    // TODO(sbdchd): move to happy-dom? https://github.com/capricorn86/happy-dom
    environment: "jsdom",
    setupFiles: ["./vitest-setup.ts"],
  },
})
