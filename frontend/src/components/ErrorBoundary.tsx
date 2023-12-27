import * as Sentry from "@sentry/react"
import * as React from "react"

import { Button } from "@/components/Buttons"
import Logo from "@/components/Logo"

const ErrorReportButton = () => (
  <Button
    size="small"
    variant="primary"
    onClick={() => {
      Sentry.showReportDialog()
    }}
  >
    Submit error report
  </Button>
)

export function ErrorBoundary({ children }: { children?: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={(args) => (
        <div>
          <div className="flex flex-col items-center justify-self-center">
            <Logo width="150" />
            <div className="flex flex-col gap-2">
              <div className="flex flex-col justify-center gap-0 text-center text-xl">
                <h1 className="text-2xl">Something's gone wrong.</h1>
                <span>
                  Try to navigate{" "}
                  <a className="font-bold" href="/">
                    home
                  </a>
                  .
                </span>
              </div>
              {args.eventId && <ErrorReportButton />}
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
