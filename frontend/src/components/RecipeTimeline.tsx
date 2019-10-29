import React from "react"
import format from "date-fns/format"
import { styled } from "@/theme"
import {
  WebData,
  mapSuccessLike,
  isSuccessLike,
  isLoading,
  isFailure,
  isInitial
} from "@/webdata"
import { IRecipe } from "@/store/reducers/recipes"
import { getRecipeTimeline, IRecipeTimelineEvent } from "@/api"
import { resultToWebdata } from "@/result"
import { SectionTitle } from "@/components/RecipeHelpers"

interface ITimelineItemProps {
  readonly type: "comment" | "scheduled" | "created"
}

interface ITimeProps {
  readonly dateTime: Date | string
}
function Time({ dateTime }: ITimeProps) {
  const datestr = String(dateTime)
  return (
    <time title={datestr} dateTime={datestr}>
      {format(dateTime, "MMM D, YYYY")}
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
  readonly date: Date
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
    date: new Date(event.on)
  }
}

function useRecipeTimeline(recipeId: IRecipe["id"]): IRecipeTimelineState {
  const [state, setState] = React.useState<IRecipeTimelineState>(undefined)
  React.useEffect(() => {
    getRecipeTimeline(recipeId).then(res => {
      setState(
        mapSuccessLike(resultToWebdata(res), d => d.map(toTimelineEvent))
      )
    })
  }, [recipeId])
  return state
}

export function RecipeTimeline({ createdAt, recipeId }: IRecipeTimelineProps) {
  const events = useRecipeTimeline(recipeId)

  return (
    <TimelineContainer>
      <SectionTitle>Timeline</SectionTitle>
      <TimelineList>
        {isSuccessLike(events) ? (
          events.data.map(e => {
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
                    📅 Scheduled for <Time dateTime={e.date} />
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
          🎉 Recipe created on <Time dateTime={createdAt} />
        </TimelineItem>
      </TimelineList>
    </TimelineContainer>
  )
}
