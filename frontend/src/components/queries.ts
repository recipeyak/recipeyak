import "@/components/scss/main.scss"

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { QueryClient, useQuery } from "@tanstack/react-query"
import { persistQueryClient } from "@tanstack/react-query-persist-client"
import {
  addDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfDay,
  startOfToday,
} from "date-fns"
import { isRight } from "fp-ts/lib/Either"

import * as api from "@/api"
import { useScheduleTeamID } from "@/hooks"
import { isOk } from "@/result"
import { IRecipe } from "@/store/reducers/recipes"
import { Failure, Success } from "@/webdata"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
})
// const sessionStoragePersister = createSyncStoragePersister({ storage: window.sessionStorage })

void persistQueryClient({
  queryClient,
  persister: localStoragePersister,
})

export function useRecipes() {
  return useQuery(
    ["recipes"],
    () =>
      api.getRecipeList().then((res) => {
        if (isOk(res)) {
          return res.data
        }
        throw res.error
      }),
    {
      onSuccess(data) {
        data.forEach((recipe) => {
          queryClient.setQueryData(["recipes", recipe.id], recipe)
        })
      },
    },
  )
}

export function useRecipe(id: number) {
  return useQuery(
    ["recipes", id],
    () =>
      api.getRecipe(id).then((res) => {
        if (isOk(res)) {
          return res.data
        }
        throw res.error
      }),
    {
      onSuccess(data) {
        queryClient.setQueryData(
          ["recipes"],
          (recipes: IRecipe[] | undefined): IRecipe[] => {
            if (recipes == null) {
              return []
            }
            return [...recipes.filter((recipe) => recipe.id !== data.id), data]
          },
        )
      },
    },
  )
}

type Recipe = { readonly id: string; readonly name: string }
type RecipeSchedule = { readonly day: string; readonly recipes: Recipe[] }

function buildSchedule(
  schedule: readonly {
    readonly on: string
    readonly recipe: {
      readonly id: string
      readonly name: string
    }
  }[],
  start: Date,
  end: Date,
): readonly RecipeSchedule[] {
  const newSchedule: {
    [key: string]: { id: string; name: string }[] | undefined
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
    })
  })
  return Object.entries(newSchedule).map(([key, value]): RecipeSchedule => {
    return { day: format(parseISO(key), "E"), recipes: value || [] }
  })
}

export function useSchedulePreview() {
  const teamID = useScheduleTeamID()
  const start = startOfToday()
  const end = startOfDay(addDays(start, 6))
  const res = useQuery(["schedule-preview", teamID, start, end], () =>
    api.getCalendarRecipeList({
      teamID,
      start,
      end,
    }),
  )
  if (res.isSuccess) {
    if (isRight(res.data)) {
      return Success(
        buildSchedule(
          res.data.right.scheduledRecipes.map((scheduledRecipe) => ({
            on: scheduledRecipe.on,
            recipe: {
              id: scheduledRecipe.recipe.id.toString(),
              name: scheduledRecipe.recipe.name,
            },
          })),
          start,
          end,
        ),
      )
    }
    return Failure(res.data.left)
  }
}
