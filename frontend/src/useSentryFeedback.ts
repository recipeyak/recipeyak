import * as Sentry from "@sentry/react"

export function useSentryFeedback() {
  const client = Sentry.getClient<Sentry.BrowserClient>()
  const feedback =
    client?.getIntegrationByName<ReturnType<typeof Sentry.feedbackIntegration>>(
      "Feedback",
    )

  if (!feedback) {
    return null
  }

  return {
    async open() {
      const form = await feedback.createForm()
      form.appendToDom()
      form.open()
    },
  }
}
