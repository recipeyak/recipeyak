import * as Sentry from "@sentry/react"
import * as React from "react"

import { Button } from "@/components/Buttons"

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
        <div className="flex h-full flex-col items-center pt-48">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col justify-center gap-0 text-center">
              <h1 className="text-2xl font-medium">Recipe Yak</h1>
              <div>Something's gone wrong.</div>
              <div>
                Try to navigating{" "}
                <a className="font-bold underline" href="/">
                  home
                </a>
              </div>
            </div>
            {args.eventId && <ErrorReportButton />}
          </div>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
