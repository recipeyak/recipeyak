import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
})
