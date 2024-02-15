import React, { useEffect } from "react"
import { Link } from "react-router-dom"

import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Footer } from "@/components/Footer"
import { Helmet } from "@/components/Helmet"
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
  title,
}: {
  children: React.ReactNode
  includeSearch?: boolean
  noContainer?: boolean
  title: string
}) {
  if (noContainer) {
    return (
      <ContainerBase includeSearch={includeSearch}>
        <Helmet title={title} />
        {children}
      </ContainerBase>
    )
  }
  return (
    <ContainerBase includeSearch={includeSearch}>
      <Helmet title={title} />
      <Container>{children}</Container>
    </ContainerBase>
  )
}

export function AuthPage(props: { children: React.ReactNode; title: string }) {
  useEffect(() => {
    const el = document.querySelector("html")
    if (el) {
      el.classList.add("bg-[--color-primary]")
    }

    return () => {
      const el2 = document.querySelector("html")
      if (el2) {
        el2.classList.remove("bg-[--color-primary]")
      }
    }
  }, [])

  return (
    <div
      // 2 rem is roughly the padding we want on the side of the panel
      className="mx-auto flex min-w-[min(400px,100%-2rem)] max-w-[min(400px,100%-2rem)] flex-col"
    >
      <Helmet title={props.title} />
      <Link
        to={pathHome({})}
        className="flex items-center justify-center px-0 pb-3 text-[2rem] font-normal text-white no-underline"
      >
        <span className="font-medium">Recipe Yak</span>
      </Link>
      {props.children}
    </div>
  )
}
