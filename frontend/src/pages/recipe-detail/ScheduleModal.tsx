import { format, isFuture, isToday, parseISO, startOfWeek } from "date-fns"
import { orderBy } from "lodash-es"
import React from "react"
import { Link } from "react-router-dom"

import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { DateInput } from "@/components/Forms"
import Clock from "@/components/icons"
import { Image } from "@/components/Image"
import { Modal } from "@/components/Modal"
import { formatDistanceToNow, formatHumanDate, toISODateString } from "@/date"
import { pathSchedule } from "@/paths"
import { RecipeFetchResponse as Recipe } from "@/queries/recipeFetch"
import { useScheduleRecipeCreate } from "@/queries/scheduledRecipeCreate"
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
        imgixFmt="small"
        sources={sources}
        grayscale={archived}
        rounded
      />
      <div>
        <div className="line-clamp-1 text-ellipsis">{name}</div>
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
    backgroundUrl: string
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
        on: parseISO(isoDate),
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
      onOpenChange={(value) => {
        onOpenChange(value)
      }}
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
                      <Box space="between" align="center" key={i}>
                        <Link
                          to={to}
                          className="grow"
                          // eslint-disable-next-line no-restricted-syntax
                          style={{ lineHeight: "1.3" }}
                        >
                          <div className="font-medium">
                            {format(on, "E")} ∙ {formatHumanDate(on)}
                          </div>
                          <Box gap={1}>
                            {isFuture(on) && <Clock size={14} />}
                            <div>
                              {isToday(on)
                                ? // avoid showing "3 hours ago" for today
                                  ""
                                : formatDistanceToNow(on, {
                                    allowFuture: true,
                                    ignoreHours: true,
                                  })}
                            </div>
                          </Box>
                        </Link>
                        <Button size="small" to={to}>
                          View
                        </Button>
                      </Box>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          <div className="mt-auto flex flex-col gap-2">
            <Button
              size="normal"
              variant="primary"
              onClick={handleSave}
              disabled={scheduledRecipeCreate.isPending}
            >
              {!scheduledRecipeCreate.isPending ? "Schedule" : "Scheduling..."}
            </Button>
          </div>
        </div>
      }
    />
  )
}
