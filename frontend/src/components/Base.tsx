import React from "react"

import ErrorBoundary from "@/components/ErrorBoundary"
import Footer from "@/components/Footer"
import { Navbar } from "@/components/Nav"

export const ContainerBase = ({
  children,
  includeSearch = true,
}: {
  children: React.ReactNode
  includeSearch?: boolean
}) => (
  <>
    <Navbar includeSearch={includeSearch} />
    <ErrorBoundary>{children}</ErrorBoundary>
  </>
)

export const Container = ({ children }: { children: React.ReactNode }) => (
  <>
    <div className="pb-3 pt-0 w-100 pl-3 pr-3">
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
    <Footer />
  </>
)

export default Container
