import * as React from "react"

import Footer from "@/components/Footer"
import { Navbar } from "@/components/Nav"
import ErrorBoundary from "@/components/ErrorBoundary"

export const ContainerBase: React.SFC = ({ children }) => (
  <>
    <Navbar />
    <ErrorBoundary>{children}</ErrorBoundary>
  </>
)

export const Container: React.SFC = ({ children }) => (
  <>
    <div className="pb-3 pt-0 container pl-3 pr-3">
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
    <Footer />
  </>
)

export default Container
