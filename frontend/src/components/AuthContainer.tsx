import React, { useEffect } from "react"
import { Link } from "react-router-dom"

import { Helmet } from "@/components/Helmet"
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
        to="/"
        className="pl-0 pr-0 fs-2rem fw-normal d-flex align-center justify-content-center pb-3 text-decoration-none has-text-white"
      >
        <Logo light />
        <span className="fw-500">Recipe Yak</span>
      </Link>
      {props.children}
    </div>
  )
}

export default AuthContainer
