import { format, isToday, parseISO, startOfWeek } from "date-fns"
import { orderBy } from "lodash-es"
import React from "react"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { Button } from "@/components/Buttons"
import { DateInput } from "@/components/DateInput"
import { Image } from "@/components/Image"
import { Modal } from "@/components/Modal"
import { formatDistanceToNow, formatHumanDate, toISODateString } from "@/date"
import { pathSchedule } from "@/paths"
import { RecipeFetchResponse as Recipe } from "@/queries/useRecipeFetch"
import { useScheduleRecipeCreate } from "@/queries/useScheduledRecipeCreate"
import { addQueryParams } from "@/querystring"

type RecentSchedule = Recipe["recentSchedules"][number]

function RecipeItem({
  sources,
  name,
  author,
  archived,
}: {
  sources: {
    url: string
    backgroundUrl: string | null
  } | null
  name: string
  author: string | null
  archived: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <Image
        width={40}
        height={40}
        size="small"
        sources={sources}
        grayscale={archived}
        rounded
      />
      <div>
        <div
          className={clx(
            "line-clamp-1 text-ellipsis",
            archived && "line-through",
          )}
        >
          {name}
        </div>
        <div className="line-clamp-1 text-ellipsis text-sm">{author}</div>
      </div>
    </div>
  )
}

export function ScheduleModal({
  isOpen,
  recipeName,
  recipeId,
  isArchived,
  scheduleHistory,
  onOpenChange,
  recipeAuthor,
  recipeImageUrl,
}: {
  readonly isOpen: boolean
  readonly recipeId: number
  readonly recipeName: string
  readonly onOpenChange: (_: boolean) => void
  readonly scheduleHistory: readonly RecentSchedule[]
  readonly recipeAuthor: string | null
  readonly isArchived: boolean
  readonly recipeImageUrl: {
    id: string
    url: string
    backgroundUrl: string | null
  } | null
}) {
  const [isoDate, setIsoDate] = React.useState(toISODateString(new Date()))
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsoDate(e.target.value)
  }

  const scheduledRecipeCreate = useScheduleRecipeCreate()
  const handleSave = () => {
    scheduledRecipeCreate.mutate(
      {
        recipeID: recipeId,
        recipeName,
        on: isoDate,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={"Schedule"}
      children={
        <div className="flex h-full flex-col gap-2">
          <RecipeItem
            sources={recipeImageUrl}
            name={recipeName}
            archived={isArchived}
            author={recipeAuthor}
          />
          <DateInput
            id="schedule-data"
            value={toISODateString(isoDate)}
            onChange={handleDateChange}
          />
          <div className="flex flex-col gap-2">
            <Button
              size="normal"
              variant="primary"
              onClick={handleSave}
              disabled={scheduledRecipeCreate.isPending}
            >
              {!scheduledRecipeCreate.isPending ? "Schedule" : "Scheduling..."}
            </Button>
          </div>

          {/* we intentionally hide from view when there are no scheduled
          recipes in the history window -- avoids having an empty state
          */}
          {scheduleHistory.length > 0 && (
            <>
              <div className="flex flex-col">
                <div className="font-medium">Recent Schedules</div>
                <div className="flex flex-col gap-2">
                  {orderBy(scheduleHistory, (x) => x.on).map((x, i) => {
                    const on = parseISO(x.on)
                    const week = toISODateString(startOfWeek(on))
                    const to = {
                      pathname: pathSchedule({}),
                      search: addQueryParams(location.search, { week }),
                    }
                    return (
                      <div
                        className="flex items-center justify-between"
                        key={i}
                      >
                        <Link to={to} className="grow ">
                          {format(on, "E")}, {formatHumanDate(on)}
                          {isToday(on)
                            ? // avoid showing "3 hours ago" for today
                              ""
                            : " · " +
                              formatDistanceToNow(on, {
                                allowFuture: true,
                                ignoreHours: true,
                              })}
                        </Link>
                        <Button size="small" to={to}>
                          View
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      }
    />
  )
}
