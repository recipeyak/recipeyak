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
import { BorderBox } from "@/components/BorderBox"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { DateInput } from "@/components/Forms"
import { toISODateString } from "@/date"
import { pathRecipeDetail } from "@/paths"
import {
  IGetShoppingListResponse,
  IIngredientItem,
  IQuantity,
  Unit,
  useShoppingListFetch,
} from "@/queries/shoppingListFetch"
import { removeQueryParams, setQueryParams } from "@/querystring"
import { ingredientByNameAlphabetical } from "@/sorters"
import { normalizeUnitsFracs } from "@/text"
import { toast } from "@/toast"

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

interface IShoppingListItemProps {
  readonly item: [string, IIngredientItem]
  readonly isFirst: boolean
}

export function toQuantity(x: IQuantity): string {
  if (x.unit === Unit.NONE) {
    return x.quantity
  }
  if (x.unit === Unit.SOME) {
    return "some"
  }
  if (x.unit === Unit.UNKNOWN && x.unknown_unit == null) {
    return x.quantity
  }
  if (x.unit === Unit.UNKNOWN && x.unknown_unit != null) {
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
  isFirst,
}: IShoppingListItemProps) {
  // padding serves to prevent the button from appearing in front of text
  // we also use <section>s instead of <p>s to avoid extra new lines in Chrome
  const cls = clx("text-sm", isFirst && "mr-15")

  const units = normalizeUnitsFracs(quantitiesToString(quantities))

  return (
    <section className={cls} key={name + units}>
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
    return <p>error fetching shoppinglist</p>
  }

  const items =
    props.items.isSuccess || props.items.isRefetchError
      ? Object.entries(props.items.data.ingredients)
      : []

  const groups = Object.entries(groupBy(items, (x) => x[1]?.category))

  return (
    <BorderBox
      p={2}
      minHeight="74px"
      className={clx(
        "max-h-[425px] overflow-y-auto border-[1px] border-solid border-[var(--color-border)] !bg-[var(--color-background-card)]",
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
                  <section style={{ maxHeight: "0.5rem" }}>
                    <br />
                  </section>
                )}
                {values.map(([name, quantities], i) => {
                  if (quantities == null) {
                    return null
                  }
                  return (
                    <ShoppingListItem
                      key={name}
                      item={[name, quantities]}
                      isFirst={i === 0}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </BorderBox>
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
    <Box dir="col" space="between">
      <Box space="between" align="center" w={100}>
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
          {show ? "hide" : "show"}
        </Button>
      </Box>
      {show && (
        <Box dir="col">
          {recipes?.map((r) => {
            return (
              <Link
                key={r.scheduledRecipeId}
                to={pathRecipeDetail({ recipeId: r.recipeId.toString() })}
                className="line-clamp-1 text-ellipsis"
              >
                {r.recipeName}
              </Link>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

function ShoppingList() {
  const ref = useRef<HTMLDivElement>(null)
  const [startDay, setStartDay] = useState(+startOfToday())
  const [endDay, setEndDay] = useState(+addWeeks(startOfToday(), 1))

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
    setStartDay(+date)
    if (isAfter(date, endDay)) {
      setEndDay(+date)
    }
  }

  const handleSetEndDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseISO(e.target.value)
    if (!isValid(date)) {
      return
    }
    setEndDay(+date)
    if (isBefore(date, startDay)) {
      setStartDay(+date)
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
    <Box dir="col" gap={1} w={100}>
      <Box dir="col" gap={1} w={100}>
        <Box gap={2} w={100} align="center">
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
        </Box>
        <RecipeAccordian recipes={recipes} />
        <Button size="small" onClick={handleCopyToClipboard}>
          Copy to Clipboard
        </Button>
      </Box>
      <ShoppingListList items={shoppingList} ref={ref} />
    </Box>
  )
}

export default ShoppingList
