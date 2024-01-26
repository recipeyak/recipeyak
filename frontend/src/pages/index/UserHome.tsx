import {
  addDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfToday,
} from "date-fns"
import React from "react"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { Box } from "@/components/Box"
import { Helmet } from "@/components/Helmet"
import { Image } from "@/components/Image"
import { Loader } from "@/components/Loader"
import { NavPage } from "@/components/Page"
import { pathSchedule } from "@/paths"
import { ResponseFromUse } from "@/queries/queryUtilTypes"
import { useRecentlyCreatedRecipesList } from "@/queries/recentlyCreatedRecipesList"
import { useRecentlyViewedRecipesList } from "@/queries/recentlyViewedRecipesList"
import { useSchedulePreviewList } from "@/queries/schedulePreviewList"
import { recipeURL } from "@/urls"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="pb-1 text-base font-medium">{children}</div>
}

function ScheduledRecipe(props: {
  readonly day: string
  readonly recipes: Recipe[]
}) {
  return (
    <Box>
      <div className="mr-2 min-w-[2.5rem] text-right text-[14px] font-bold">
        {props.day}
      </div>
      <Box gap={1} dir="col" grow={1}>
        {props.recipes.length === 0 ? (
          <div className="text-[--color-text-muted]">—</div>
        ) : null}
        {props.recipes.map((x) => (
          <RecipeSlide key={x.id} recipe={x} />
        ))}
      </Box>
    </Box>
  )
}

function ScheduleContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full rounded-md border border-solid border-[--color-border] bg-[--color-background-calendar-day] p-3 text-sm sm:w-[350px] sm:max-w-[350px]"
      children={children}
    />
  )
}

type Recipe = {
  readonly id: number | string
  readonly name: string
  readonly author: string | null
  readonly archivedAt: string | null
  readonly primaryImage: {
    id: number | string
    url: string
    backgroundUrl: string | null
  } | null
}
type RecipeSchedule = { readonly day: string; readonly recipes: Recipe[] }

function buildSchedule(
  schedule: readonly {
    readonly on: string
    readonly recipe: Recipe
  }[],
  start: Date,
  end: Date,
): readonly RecipeSchedule[] {
  const newSchedule: {
    [key: string]: Recipe[] | undefined
  } = {}
  eachDayOfInterval({
    start,
    end,
  }).forEach((day) => {
    newSchedule[day.toISOString()] = []
  })
  schedule.forEach((x) => {
    const date = parseISO(x.on)
    const s = newSchedule[date.toISOString()]
    if (s == null) {
      newSchedule[date.toISOString()] = []
    }
    newSchedule[date.toISOString()]?.push({
      id: x.recipe.id,
      name: x.recipe.name,
      author: x.recipe.author,
      archivedAt: x.recipe.archivedAt,
      primaryImage: x.recipe.primaryImage,
    })
  })
  return Object.entries(newSchedule).map(([key, value]): RecipeSchedule => {
    return { day: format(parseISO(key), "E"), recipes: value || [] }
  })
}

function useSchedulePreview() {
  const start = startOfToday()
  const end = addDays(start, 6)
  const res = useSchedulePreviewList({ start, end })

  if (res.data == null) {
    return null
  }
  return buildSchedule(
    res.data.scheduledRecipes.map((scheduledRecipe) => ({
      on: scheduledRecipe.on,
      recipe: {
        id: scheduledRecipe.recipe.id.toString(),
        name: scheduledRecipe.recipe.name,
        author: scheduledRecipe.recipe.author,
        archivedAt: scheduledRecipe.recipe.archivedAt,
        primaryImage: scheduledRecipe.recipe.primaryImage,
      },
    })),
    start,
    end,
  )
}

function SchedulePreview() {
  const scheduledRecipes = useSchedulePreview()
  return (
    <ScheduleContainer>
      <Link to={pathSchedule({})}>
        <SectionTitle>Schedule</SectionTitle>
      </Link>
      <Box gap={2} dir="col">
        {scheduledRecipes?.map((x) => (
          <ScheduledRecipe key={x.day} day={x.day} recipes={x.recipes} />
        ))}
      </Box>
    </ScheduleContainer>
  )
}

function CreatedBy({ createdBy }: { createdBy: NonNullable<CreatedBy> }) {
  const imageCss =
    "w-[20px] h-[20px] min-w-[20px] rounded-full bg-[--color-background-empty-image]"
  return (
    <div className="flex gap-1">
      {createdBy.avatarUrl ? (
        <img src={createdBy.avatarUrl} className={imageCss} />
      ) : (
        <div className={imageCss} />
      )}
      <div>{createdBy.name}</div>
    </div>
  )
}

function RecipeSlide({
  recipe: r,
  createdBy,
}: {
  recipe: Recipe
  createdBy?: CreatedBy | null
}) {
  return (
    <Link key={r.id} to={recipeURL(r.id, r.name)}>
      <Box key={r.id} gap={2} className="items-center">
        <Image
          width={48}
          height={48}
          imgixFmt="small"
          grayscale={!!r.archivedAt}
          sources={r.primaryImage}
          rounded
        />
        <Box dir="col" w={100}>
          <div
            className={clx(
              "line-clamp-1 text-ellipsis",
              r.archivedAt != null && "line-through",
            )}
          >
            {r.name}
          </div>
          <div className="line-clamp-1 text-ellipsis text-[0.875em]">
            {r.author}
          </div>
          {createdBy && <CreatedBy createdBy={createdBy} />}
        </Box>
      </Box>
    </Link>
  )
}

function RecentlyViewed() {
  const recipes = useRecentlyViewedRecipesList()

  return (
    <ScheduleContainer>
      <SectionTitle>Recently Viewed</SectionTitle>
      <Box dir="col" gap={2}>
        {recipes.isError ? (
          <div>error loading</div>
        ) : recipes.data == null ? (
          <Loader align="left" />
        ) : recipes.data.length === 0 ? (
          <div>no recipes viewed</div>
        ) : (
          recipes.data.map((r) => <RecipeSlide key={r.id} recipe={r} />)
        )}
      </Box>
    </ScheduleContainer>
  )
}

type CreatedBy = ResponseFromUse<
  typeof useRecentlyCreatedRecipesList
>[number]["createdBy"]

function RecentlyCreated() {
  const recipes = useRecentlyCreatedRecipesList()

  return (
    <ScheduleContainer>
      <SectionTitle>Recently Created</SectionTitle>
      <Box dir="col" gap={2}>
        {recipes.isError ? (
          <div>error loading</div>
        ) : recipes.data == null ? (
          <Loader align="left" />
        ) : recipes.data.length === 0 ? (
          <div>no recipes viewed</div>
        ) : (
          recipes.data.map((r) => (
            <RecipeSlide key={r.id} recipe={r} createdBy={r.createdBy} />
          ))
        )}
      </Box>
    </ScheduleContainer>
  )
}

export const UserHome = () => {
  return (
    <NavPage>
      <Helmet title="Home" />
      <div className="mt-2 flex flex-wrap items-start justify-center gap-4">
        <SchedulePreview />
        <RecentlyViewed />
        <RecentlyCreated />
      </div>
    </NavPage>
  )
}
