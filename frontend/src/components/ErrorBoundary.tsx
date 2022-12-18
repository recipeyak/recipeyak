import Raven from "raven-js"
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
      Raven.showReportDialog()
    }}
  >
    Submit error report
  </Button>
)

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  IErrorBoundaryState
> {
  state = {
    error: null,
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error })
    Raven.captureException(error, { extra: errorInfo })
  }
  render() {
    const errorReported = Boolean(Raven.lastEventId())
    if (this.state.error) {
      return (
        <div className="container">
          <section className="align-center column d-flex flex-direction-column is-half is-offset-one-quarter justify-center">
            <Logo width="150" />
            <div className="d-flex flex-direction-column fs-5 justify-content-center text-center">
              <h1 className="fs-7 ">Something's gone wrong.</h1>
              <p>
                {" "}
                Try to navigate{" "}
                <a className="fw-bold" href="/">
                  home
                </a>
                .{errorReported && <ErrorReportButton />}
              </p>
            </div>
          </section>
        </div>
      )
    }
    return this.props.children
  }
}
