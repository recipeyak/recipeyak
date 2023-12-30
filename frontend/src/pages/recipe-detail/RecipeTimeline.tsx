import format from "date-fns/format"
import { Link } from "react-router-dom"

import { formatHumanDate } from "@/date"
import { SectionTitle } from "@/pages/recipe-detail/RecipeHelpers"
import { pathSchedule } from "@/paths"
import { useTimelineList } from "@/queries/timelineList"

interface ITimeProps {
  readonly dateTime: Date | string
}
function Time({ dateTime }: ITimeProps) {
  const date = new Date(dateTime)
  const dateFormat = format(date, "yyyy-M-d")
  const prettyDate = formatHumanDate(date)
  return (
    <time title={prettyDate} dateTime={dateFormat}>
      {prettyDate}
    </time>
  )
}

function TimelineItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="mb-2 rounded-md border border-solid border-[var(--color-border)] bg-[var(--color-background-calendar-day)] p-2 font-medium">
      {children}
    </li>
  )
}

function TimelineList({ children }: { children: React.ReactNode }) {
  return (
    <ol className="ml-2 list-none border-[0px] border-l-[2px] border-solid py-2 pl-2">
      {children}
    </ol>
  )
}
interface IRecipeTimelineProps {
  readonly recipeId: number
  readonly createdAt: string
}

export function RecipeTimeline({ createdAt, recipeId }: IRecipeTimelineProps) {
  const res = useTimelineList(recipeId)
  if (res.data == null) {
    return null
  }
  return (
    <div className="max-w-[600px]">
      <SectionTitle>Timeline</SectionTitle>
      <TimelineList>
        {res.data.map((e) => {
          switch (e.type) {
            case "comment":
              return (
                <TimelineItem key={e.id}>
                  <div>💬 {e.author} commented</div>
                </TimelineItem>
              )
            case "scheduled":
              return (
                <TimelineItem key={e.id}>
                  📅 Scheduled for{" "}
                  <Link
                    to={{
                      pathname: pathSchedule({}),
                      search: `week=${e.date}`,
                    }}
                  >
                    <Time dateTime={new Date(e.date)} />
                  </Link>
                </TimelineItem>
              )
            default:
              return null
          }
        })}
        <TimelineItem>
          🎉 Recipe created on <Time dateTime={new Date(createdAt)} />
        </TimelineItem>
      </TimelineList>
    </div>
  )
}
