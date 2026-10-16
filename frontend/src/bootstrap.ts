import { calendarList } from "@/api/calendarList"
import { userRetrieve } from "@/api/userRetrieve"

// backend-rs embeds the data for the first page in index.html so we can skip
// those API requests on load. It's missing when the page came from the static
// file, e.g., in dev or when backend-rs is down, so callers fall back to
// fetching.

type Bootstrap = {
  user?: Awaited<ReturnType<typeof userRetrieve>>
  calendar?:
    | ({ team: number; start: string; end: string } & Awaited<
        ReturnType<typeof calendarList>
      >)
    | null
}

const bootstrap = read()

function read(): Bootstrap {
  const text = document.getElementById("bootstrap")?.textContent
  if (!text) {
    return {}
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(text)
  } catch {
    return {}
  }
}

// Each value is used once, so later fetches get fresh data.

export function takeBootstrapUser() {
  const user = bootstrap.user
  bootstrap.user = undefined
  return user
}

export function takeBootstrapCalendar({
  teamId,
  start,
  end,
}: {
  teamId: number
  start: string
  end: string
}) {
  const calendar = bootstrap.calendar
  // Before the user loads, the query runs with a placeholder team id.
  if (calendar?.team !== teamId) {
    return undefined
  }
  bootstrap.calendar = undefined
  // The server doesn't know our timezone, so it sends a wider range.
  if (calendar.start > start || calendar.end < end) {
    return undefined
  }
  return {
    scheduledRecipes: calendar.scheduledRecipes.filter(
      (x) => x.on >= start && x.on <= end,
    ),
  }
}
