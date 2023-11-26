import React, { useEffect } from "react"
import { Link } from "react-router-dom"

import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Footer } from "@/components/Footer"
import { Helmet } from "@/components/Helmet"
import Logo from "@/components/Logo"
import { Navbar } from "@/components/Nav"
import { pathHome } from "@/paths"

const ContainerBase = ({
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

const Container = ({ children }: { children: React.ReactNode }) => (
  <>
    <div className="w-full px-3 pb-3 pt-0 print:!text-black">
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
    <Footer />
  </>
)

export function NavPage({
  children,
  includeSearch = true,
  noContainer,
}: {
  children: React.ReactNode
  includeSearch?: boolean
  noContainer?: boolean
}) {
  if (noContainer) {
    return (
      <ContainerBase includeSearch={includeSearch}>{children}</ContainerBase>
    )
  }
  return (
    <ContainerBase includeSearch={includeSearch}>
      <Container>{children}</Container>
    </ContainerBase>
  )
}

export function AuthPage(props: { children: React.ReactNode }) {
  useEffect(() => {
    const el = document.querySelector("html")
    if (el) {
      el.classList.add("bg-primary")
    }

    return () => {
      const el2 = document.querySelector("html")
      if (el2) {
        el2.classList.remove("bg-primary")
      }
    }
  }, [])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginLeft: "auto",
        marginRight: "auto",
        // 2 rem is roughly the padding we want on the side of the panel
        minWidth: "min(400px, 100% - 2rem)",
      }}
    >
      <Helmet title="Auth" />
      <Link
        to={pathHome({})}
        className="flex items-center justify-center px-0 pb-3 text-[2rem] font-normal text-white no-underline"
      >
        <Logo light />
        <span className="font-medium">Recipe Yak</span>
      </Link>
      {props.children}
    </div>
  )
}
