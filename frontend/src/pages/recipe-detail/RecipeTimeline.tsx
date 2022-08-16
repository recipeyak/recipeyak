import format from "date-fns/format"
import React from "react"
import { Link } from "react-router-dom"

import { getRecipeTimeline, IRecipeTimelineEvent } from "@/api"
import { SectionTitle } from "@/components/RecipeHelpers"
import { useScheduleURL } from "@/hooks"
import { resultToWebdata } from "@/result"
import { IRecipe } from "@/store/reducers/recipes"
import { styled } from "@/theme"
import {
  isFailure,
  isInitial,
  isLoading,
  isSuccessLike,
  mapSuccessLike,
  WebData,
} from "@/webdata"

interface ITimelineItemProps {
  readonly type: "comment" | "scheduled" | "created"
}

interface ITimeProps {
  readonly dateTime: Date | string
}
function Time({ dateTime }: ITimeProps) {
  const date = new Date(dateTime)
  const dateFormat = format(date, "yyyy-M-d")
  const prettyDate = format(date, "MMM d, yyyy")
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

const LoadingContainer = styled.div`
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
`

function LoadingTimeline() {
  return <LoadingContainer>Loading timeline..</LoadingContainer>
}

function FailureLoadingTimeline() {
  return <LoadingContainer>Failure loading timeline..</LoadingContainer>
}

type ITimelineEvent = ICommentEvent | IScheduledRecipeEvent

interface ICommentEvent {
  readonly id: number
  readonly type: "comment"
  readonly author: string
}
interface IScheduledRecipeEvent {
  readonly id: number
  readonly type: "scheduled"
  readonly date: string
}

interface IRecipeTimelineProps {
  readonly recipeId: number
  readonly createdAt: string
}

type IRecipeTimelineState = WebData<ReadonlyArray<ITimelineEvent>>

function toTimelineEvent(event: IRecipeTimelineEvent): ITimelineEvent {
  return {
    type: "scheduled",
    id: event.id,
    date: event.on,
  }
}

function useRecipeTimeline(recipeId: IRecipe["id"]): IRecipeTimelineState {
  const [state, setState] = React.useState<IRecipeTimelineState>(undefined)
  React.useEffect(() => {
    void getRecipeTimeline(recipeId).then((res) => {
      setState(
        mapSuccessLike(resultToWebdata(res), (d) => d.map(toTimelineEvent)),
      )
    })
  }, [recipeId])
  return state
}

export function RecipeTimeline({ createdAt, recipeId }: IRecipeTimelineProps) {
  const events = useRecipeTimeline(recipeId)
  const scheduleURL = useScheduleURL()
  return (
    <TimelineContainer>
      <SectionTitle>Timeline</SectionTitle>
      <TimelineList>
        {isSuccessLike(events) ? (
          events.data.map((e) => {
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
                    <Link to={scheduleURL + `?week=${e.date}`}>{e.date}</Link>
                  </TimelineItem>
                )
              default:
                return null
            }
          })
        ) : isLoading(events) || isInitial(events) ? (
          <LoadingTimeline />
        ) : isFailure(events) ? (
          <FailureLoadingTimeline />
        ) : null}
        <TimelineItem type="created">
          🎉 Recipe created on <Time dateTime={new Date(createdAt)} />
        </TimelineItem>
      </TimelineList>
    </TimelineContainer>
  )
}
