"use client"

import "@/components/scss/main.scss"

import dynamic from "next/dynamic"

const App = dynamic(() => import("@/components/App"), { ssr: false })

export default function Page() {
  return <App />
}
