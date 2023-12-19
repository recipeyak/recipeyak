import * as Sentry from "@sentry/react"
import * as React from "react"

import { Button } from "@/components/Buttons"
import Logo from "@/components/Logo"

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

export function ErrorBoundary({ children }: { children?: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={(args) => (
        <div className="">
          <section className="flex flex-col items-center justify-self-center">
            <Logo width="150" />
            <div className="flex flex-col justify-center text-center text-xl">
              <h1 className="text-2xl">Something's gone wrong.</h1>
              <div>
                Try to navigate{" "}
                <a className="font-bold" href="/">
                  home
                </a>
                .{args.eventId && <ErrorReportButton />}
              </div>
            </div>
          </section>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
