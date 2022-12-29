import format from "date-fns/format"
import { Link } from "react-router-dom"

import { formatHumanDate } from "@/date"
import { useCurrentUser } from "@/hooks"
import { SectionTitle } from "@/pages/recipe-detail/RecipeHelpers"
import { useTimelineList } from "@/queries/timelineList"
import { styled } from "@/theme"
import { scheduleURLFromTeamID } from "@/urls"

interface ITimelineItemProps {
  readonly type: "comment" | "scheduled" | "created"
}

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

const TimelineItem = styled.li<ITimelineItemProps>`
  font-weight: 500;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 5px;
  border: 1px solid lightgray;
`

const TimelineContainer = styled.div`
  max-width: 600px;
`

const TimelineList = styled.ol`
  list-style: none;
  margin-left: 0.5rem;
  padding-left: 0.5rem;
  border-left: 3px solid;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
`

interface IRecipeTimelineProps {
  readonly recipeId: number
  readonly createdAt: string
}

export function RecipeTimeline({ createdAt, recipeId }: IRecipeTimelineProps) {
  const res = useTimelineList(recipeId)
  const user = useCurrentUser()
  const scheduleURL = scheduleURLFromTeamID(user.scheduleTeamID)
  if (res.data == null) {
    return null
  }
  return (
    <TimelineContainer>
      <SectionTitle>Timeline</SectionTitle>
      <TimelineList>
        {res.data.map((e) => {
          switch (e.type) {
            case "comment":
              return (
                <TimelineItem key={e.id} type={e.type}>
                  <p>💬 {e.author} commented</p>
                </TimelineItem>
              )
            case "scheduled":
              return (
                <TimelineItem key={e.id} type={e.type}>
                  📅 Scheduled for{" "}
                  <Link to={scheduleURL + `?week=${e.date}`}>
                    <Time dateTime={new Date(e.date)} />
                  </Link>
                </TimelineItem>
              )
            default:
              return null
          }
        })}
        <TimelineItem type="created">
          🎉 Recipe created on <Time dateTime={new Date(createdAt)} />
        </TimelineItem>
      </TimelineList>
    </TimelineContainer>
  )
}
