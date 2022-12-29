import { DefaultBodyType, MockedRequest, rest } from "msw"
import { setupServer } from "msw/node"

import { store } from "@/store/store"

export { rest }

type Deferred<T> = {
  promise: PromiseLike<T>
  done: () => void
  error: () => void
}

// based from: https://stackoverflow.com/a/69027809/3720597
function deferred<T>(data: T): Deferred<T> {
  let resolve: (value: T | PromiseLike<T>) => void
  let reject: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return {
    promise,
    done: () => {
      resolve(data)
    },
    error: () => {
      reject(data)
    },
  }
}

beforeEach(() => {
  store.dispatch({ type: "@@RESET" })
})

export const server = setupServer()
// Start server before all tests
beforeAll(() => {
  server.listen()
})
// Close server after all tests
afterAll(() => {
  server.close()
})
// Reset handlers after each test `important for test isolation`
afterEach(() => {
  server.resetHandlers()
})

// We setup all this stuff below to get test failures when we forget to mock an
// endpoint.
// ideally it would be builtin, waiting on: https://github.com/mswjs/msw/issues/946
const inprogress = new Map<string, Deferred<MockedRequest<DefaultBodyType>>>()

// Two options, either a request is mocked or it's not.
// If it's mocked we'll hit the request:match, otherwise we'll hit
// request:unhandled.
server.events.on("request:start", (req) => {
  inprogress.set(req.id, deferred(req))
})
server.events.on("request:match", (req) => {
  inprogress.get(req.id)?.done()
})
server.events.on("request:unhandled", (req) => {
  inprogress.get(req.id)?.error()
})

// check if we had any unhandled requests
afterEach(async () => {
  const errors = (
    await Promise.allSettled([...inprogress.values()].map((x) => x.promise))
  )
    .filter((x): x is PromiseRejectedResult => x.status === "rejected")
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    .map((x): MockedRequest<DefaultBodyType> => x.reason)
  inprogress.clear()
  if (errors.length) {
    // TODO: figure out if we can include where in the code the request was called
    const err = Error(
      errors
        .map(
          (req) =>
            `found an unhandled ${req.method} request to ${req.url.href}`,
        )
        .join("\n\n"),
    )
    // clear the useless stack trace
    err.stack = undefined
    throw err
  }
})
