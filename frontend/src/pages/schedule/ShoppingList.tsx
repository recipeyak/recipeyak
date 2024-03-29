import { UseQueryResult } from "@tanstack/react-query"
import { addWeeks, parseISO, startOfToday } from "date-fns"
import format from "date-fns/format"
import isAfter from "date-fns/isAfter"
import isBefore from "date-fns/isBefore"
import isValid from "date-fns/isValid"
import { groupBy } from "lodash-es"
import React, { useEffect, useRef, useState } from "react"
import { useHistory } from "react-router"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { Button } from "@/components/Buttons"
import { DateInput } from "@/components/DateInput"
import { toISODateString } from "@/date"
import {
  IGetShoppingListResponse,
  IIngredientItem,
  IQuantity,
  useShoppingListFetch,
} from "@/queries/useShoppingListFetch"
import { removeQueryParams, setQueryParams } from "@/querystring"
import { ingredientByNameAlphabetical } from "@/sorters"
import { normalizeUnitsFracs } from "@/text"
import { toast } from "@/toast"
import { recipeURL } from "@/urls"

const selectElementText = (el: Element) => {
  const sel = window.getSelection()
  if (sel == null) {
    return
  }
  const range = document.createRange()
  range.selectNodeContents(el)
  sel.removeAllRanges()
  sel.addRange(range)
}

const removeSelection = () => {
  const sel = window.getSelection()
  if (sel == null) {
    return
  }
  sel.removeAllRanges()
}

function formatMonth(date: number | Date | null) {
  if (date == null) {
    return ""
  }
  return format(date, "yyyy-MM-dd")
}

function toQuantity(x: IQuantity): string {
  if (x.unit === "NONE") {
    return x.quantity
  }
  if (x.unit === "SOME") {
    return "some"
  }
  if (x.unit === "UNKNOWN" && x.unknown_unit == null) {
    return x.quantity
  }
  if (x.unit === "UNKNOWN" && x.unknown_unit != null) {
    return x.quantity + " " + x.unknown_unit
  }
  const unit = x.unit.toLowerCase()
  return x.quantity + " " + unit
}

function quantitiesToString(quantities: ReadonlyArray<IQuantity>): string {
  return quantities.map(toQuantity).join(" + ")
}

function ShoppingListItem({
  item: [name, { quantities }],
}: {
  item: [string, IIngredientItem]
}) {
  const units = normalizeUnitsFracs(quantitiesToString(quantities))

  return (
    // eslint-disable-next-line react/forbid-elements
    <section className="text-sm" key={name + units}>
      {units} {name}
    </section>
  )
}

interface IShoppingListContainerProps {
  readonly items: UseQueryResult<IGetShoppingListResponse, unknown>
}

const ShoppingListList = React.forwardRef<
  HTMLDivElement | null,
  IShoppingListContainerProps
>((props, ref) => {
  if (props.items.isError) {
    return <div>error fetching shoppinglist</div>
  }

  const items =
    props.items.isSuccess || props.items.isRefetchError
      ? Object.entries(props.items.data.ingredients)
      : []

  const groups = Object.entries(groupBy(items, (x) => x[1]?.category))

  return (
    <div
      className={clx(
        "max-h-[425px] min-h-[74px] overflow-y-auto rounded-none border-[1px] border-solid border-[--color-border] bg-[--color-background-card] p-3 text-[--color-text] sm:rounded-md",
        props.items.isPending || props.items.isRefetching ? "opacity-70" : "",
      )}
    >
      {props.items.isPending ? (
        <div className="text-center" data-testid="shopping list items loading">
          loading...
        </div>
      ) : (
        <div
          ref={ref}
          className="cursor-auto select-text"
          data-testid="shopping-list-items"
        >
          {groups.map(([groupName, values], groupIndex) => {
            values.sort((x, y) => ingredientByNameAlphabetical(x[0], y[0]))
            return (
              <div key={groupName}>
                {groupIndex > 0 && (
                  // ensure copying the list has a new line between categories

                  // eslint-disable-next-line react/forbid-elements, no-restricted-syntax
                  <section style={{ maxHeight: "0.5rem" }}>
                    <br />
                  </section>
                )}
                {values.map(([name, quantities]) => {
                  if (quantities == null) {
                    return null
                  }
                  return (
                    <ShoppingListItem key={name} item={[name, quantities]} />
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

function RecipeAccordian({
  recipes,
}: {
  // null when loading
  recipes:
    | {
        scheduledRecipeId: number
        recipeId: number
        recipeName: string
      }[]
    | null
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col justify-between">
      <div className="flex w-full items-center justify-between">
        <div className="font-medium">
          {recipes?.length ?? "-"}{" "}
          {recipes?.length === 1 ? "recipe" : "recipes"}
        </div>
        <Button
          size="small"
          onClick={() => {
            setShow(!show)
          }}
        >
          {show ? "Hide" : "Show"}
        </Button>
      </div>
      {show && (
        <div className="flex flex-col">
          {recipes?.map((r) => {
            return (
              <Link
                key={r.scheduledRecipeId}
                to={recipeURL(r.recipeId, r.recipeName)}
                className="line-clamp-1 text-ellipsis"
              >
                {r.recipeName}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ShoppingList() {
  const ref = useRef<HTMLDivElement>(null)
  const [startDay, setStartDay] = useState(startOfToday())
  const [endDay, setEndDay] = useState(addWeeks(startOfToday(), 1))

  const shoppingList = useShoppingListFetch({ startDay, endDay })
  const history = useHistory()

  useEffect(() => {
    setQueryParams(history, {
      shoppingStartDay: toISODateString(startDay),
      shoppingEndDay: toISODateString(endDay),
    })
    return () => {
      removeQueryParams(history, ["shoppingStartDay", "shoppingEndDay"])
    }
  }, [history, startDay, endDay])

  const handleSetStartDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseISO(e.target.value)
    if (!isValid(date)) {
      return
    }
    setStartDay(date)
    if (isAfter(date, endDay)) {
      setEndDay(date)
    }
  }

  const handleSetEndDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseISO(e.target.value)
    if (!isValid(date)) {
      return
    }
    setEndDay(date)
    if (isBefore(date, startDay)) {
      setStartDay(date)
    }
  }

  const handleCopyToClipboard = () => {
    const el = ref.current
    if (el == null) {
      return
    }
    selectElementText(el)
    document.execCommand("copy")
    removeSelection()
    toast("Shopping list copied to clipboard!")
  }

  const recipes = shoppingList.data?.recipes ?? null

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex w-full flex-col gap-1">
        <div className="flex w-full items-center gap-2">
          <DateInput
            onChange={handleSetStartDay}
            placeholder="from"
            value={formatMonth(startDay)}
          />
          <h2 className="text-base">→</h2>
          <DateInput
            onChange={handleSetEndDay}
            placeholder="to"
            value={formatMonth(endDay)}
          />
        </div>
        <RecipeAccordian recipes={recipes} />
        <Button size="small" onClick={handleCopyToClipboard}>
          Copy to Clipboard
        </Button>
      </div>
      <ShoppingListList items={shoppingList} ref={ref} />
    </div>
  )
}

export default ShoppingList
