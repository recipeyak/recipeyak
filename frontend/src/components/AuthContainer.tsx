import React, { useEffect } from "react"
import { Helmet } from "@/components/Helmet"
import { Link } from "react-router-dom"

import Logo from "@/components/Logo"

interface IAuthContainerProps {
  readonly children: React.ReactNode
}

function AuthContainer(props: IAuthContainerProps) {
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
    <section className="section">
      <Helmet title="Auth" />
      <div className="container">
        <div className="columns">
          <div className="column is-half-tablet is-offset-one-quarter-tablet is-one-third-desktop is-offset-one-third-desktop">
            <Link
              to="/"
              className="pl-0 pr-0 fs-2rem fw-normal d-flex align-center justify-content-center pb-3 text-decoration-none has-text-white"
            >
              <Logo light />
              <span className="fw-500">Recipe Yak</span>
            </Link>
            {props.children}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AuthContainer
