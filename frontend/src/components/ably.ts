import * as Ably from "ably"

export const client = new Ably.Realtime.Promise({
  authUrl: "/api/v1/auth/ably/",
})
