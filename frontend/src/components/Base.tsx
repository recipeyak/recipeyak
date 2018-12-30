import * as React from "react"

import Footer from "@/components/Footer"
import Navbar from "@/containers/Nav"
import SearchModal from "@/components/SearchModal"
import ErrorBoundary from "@/components/ErrorBoundary"

export const ContainerBase: React.SFC = ({ children }) => (
  <>
    <Navbar className="pl-3 pr-3" />
    <ErrorBoundary>{children}</ErrorBoundary>
    <SearchModal />
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
