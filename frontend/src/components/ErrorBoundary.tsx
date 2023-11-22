import * as Sentry from "@sentry/react"
import * as React from "react"

import { Button } from "@/components/Buttons"
import Logo from "@/components/Logo"

interface IErrorBoundaryState {
  readonly error: null | Error
}

const ErrorReportButton = () => (
  <Button
    size="small"
    variant="primary"
    className="ml-1"
    onClick={() => {
      Sentry.showReportDialog()
    }}
  >
    Submit error report
  </Button>
)

export default function ErrorBoundary({
  children,
}: {
  children?: React.ReactNode
}) {
  return (
    <Sentry.ErrorBoundary
      fallback={(args) => (
        <div className="">
          <section className="align-center d-flex flex-direction-column justify-center">
            <Logo width="150" />
            <div className="d-flex flex-direction-column fs-5 justify-content-center text-center">
              <h1 className="fs-7 ">Something's gone wrong.</h1>
              <p>
                Try to navigate{" "}
                <a className="fw-bold" href="/">
                  home
                </a>
                .{args.eventId && <ErrorReportButton />}
              </p>
            </div>
          </section>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
