import { Hit } from "@algolia/client-search"
import { useState } from "react"
import { useFocusVisible } from "react-aria"
import {
  ComboBox,
  Group,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxItemProps,
  Popover,
} from "react-aria-components"

import { clx } from "@/classnames"
import { Button } from "@/components/Buttons"
import { CustomHighlight } from "@/components/CustomHighlight"
import { DateInput } from "@/components/DateInput"
import { Image } from "@/components/Image"
import { Modal } from "@/components/Modal"
import { toISODateString } from "@/date"
import { useScheduleRecipeCreate } from "@/queries/useScheduledRecipeCreate"
import { useSearchRecipes } from "@/queries/useSearchRecipes"

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

function RecipeSelect({
  onSelect,
  value,
}: {
  onSelect: (_: RecipeSearchItemSelection | undefined) => void
  value: RecipeSearchItemSelection | undefined
}) {
  const [query, setQuery] = useState("")
  const { data } = useSearchRecipes({ query })
  const hits = data?.hits ?? []
  const { isFocusVisible } = useFocusVisible()

  if (value != null) {
    return (
      <div className="w-full">
        <label className="cursor-default font-medium">Recipe</label>
        <div className="flex items-center justify-between">
          <RecipeItem
            key={value.id}
            sources={value.primary_image}
            archived={value.archived_at != null}
            name={value.name}
            author={value.author ?? ""}
          />
          <Button
            size="small"
            onClick={() => {
              onSelect(undefined)
            }}
          >
            Change
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ComboBox
      className="group flex w-full flex-col gap-1"
      inputValue={query}
      onInputChange={setQuery}
      items={hits}
      menuTrigger="focus"
      onSelectionChange={(key) => {
        const item = hits.find((x) => x.id === key)
        onSelect(item)
      }}
    >
      <Label className="cursor-default font-medium">Recipe</Label>

      <Group className="flex rounded-md border border-solid border-[--color-border]">
        <Input
          className={() =>
            clx(
              "w-full flex-1 rounded-md border-none bg-transparent px-3 py-2 text-base leading-5 text-[--color-text] outline-none -outline-offset-1 placeholder:text-[--color-input-placeholder]",
              isFocusVisible &&
                "focus-within:outline focus-within:outline-[2px] focus-within:outline-[rgb(47,129,247)]",
            )
          }
          placeholder={"search recipes"}
        />
        <Button className="flex items-center rounded-l-none rounded-r-md border-0 border-l border-solid px-3 transition">
          ▼
        </Button>
      </Group>
      <Popover className="w-[--trigger-width] overflow-auto rounded-md border border-solid border-[--color-border] bg-[--color-background-card] text-base shadow-lg ring-1 ring-black/5">
        <ListBox<
          (typeof hits)[number]
        > className="max-h-[375px] p-1 outline-none">
          {(hit) => {
            return (
              <UserItem textValue={hit.name}>
                <RecipeItem
                  key={hit.id}
                  sources={hit.primary_image}
                  archived={hit.archived_at != null}
                  hit={hit}
                  name={hit.name}
                  author={hit.author ?? ""}
                />
              </UserItem>
            )
          }}
        </ListBox>
      </Popover>
    </ComboBox>
  )
}

function UserItem(props: ListBoxItemProps & { children: React.ReactNode }) {
  return (
    <ListBoxItem
      {...props}
      className="group flex cursor-default select-none items-center gap-2 p-1"
    >
      {({ isSelected, isFocusVisible }) => {
        return (
          <>
            <span
              className={clx(
                "group-selected:font-medium flex flex-1 items-center gap-3 truncate font-normal ",
                isFocusVisible &&
                  "rounded-md outline outline-[3px] outline-[rgb(47,129,247)]",
              )}
            >
              {props.children}
            </span>
            {isSelected && (
              <span className="flex w-5 items-center">
                <CheckIcon />
              </span>
            )}
          </>
        )
      }}
    </ListBoxItem>
  )
}

function RecipeItem({
  sources,
  name,
  author,
  archived,
  onClick,
  hit,
}: {
  sources: {
    readonly url: string
    readonly background_url: string | null
  } | null
  name: string
  author: string
  archived: boolean
  onClick?: () => void
  hit?: Hit<{}>
}) {
  return (
    <div
      className="flex cursor-pointer items-center gap-2"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onClick?.()
        }
      }}
    >
      <Image
        size="large"
        sources={
          sources
            ? { backgroundUrl: sources.background_url, url: sources.url }
            : null
        }
        height={40}
        rounded
        grayscale={archived}
        width={40}
      />
      <div>
        <div
          className={clx(
            "line-clamp-1 text-ellipsis",
            archived && "line-through",
          )}
        >
          {hit ? <CustomHighlight hit={hit} attribute="name" /> : name}
        </div>
        <div className="line-clamp-1 text-ellipsis text-sm">
          {hit ? <CustomHighlight hit={hit} attribute="author" /> : author}
        </div>
      </div>
    </div>
  )
}

type RecipeSearchItem = {
  readonly id: number
  readonly name: string
  readonly author: string | null
  readonly archived_at: string | null
  readonly primary_image: {
    readonly url: string
    readonly background_url: string | null
  } | null
}

type RecipeSearchItemSelection = Pick<
  RecipeSearchItem,
  "id" | "name" | "primary_image" | "author" | "archived_at"
>

export function ScheduleRecipeModal({
  isOpen,
  onOpenChange,
  defaultValue,
}: {
  isOpen?: boolean
  onOpenChange?: (_: boolean) => void
  defaultValue?: string
}) {
  const [isoDate, setIsoDate] = useState(
    defaultValue ?? toISODateString(new Date()),
  )
  const [formError, setFormError] = useState("")
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError("")
    setIsoDate(e.target.value)
  }
  const [selectedItem, setSelectedItem] = useState<RecipeSearchItemSelection>()
  const scheduledRecipeCreate = useScheduleRecipeCreate()

  return (
    <Modal
      title="Schedule a Recipe"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      children={({ close }) => (
        <form
          className="flex h-full flex-col items-start gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (selectedItem == null) {
              setFormError("Please select a recipe to schedule.")
              return
            }
            scheduledRecipeCreate.mutate({
              recipeID: selectedItem.id,
              recipeName: selectedItem.name,
              on: isoDate,
            })
            close()
            setFormError("")
            setIsoDate("")
            setSelectedItem(undefined)
          }}
        >
          <RecipeSelect onSelect={setSelectedItem} value={selectedItem} />

          <label className="flex w-full flex-col gap-1">
            <label className="font-medium" htmlFor="schedule-data">
              Date
            </label>
            <DateInput
              id="schedule-data"
              value={isoDate}
              onChange={handleDateChange}
            />
          </label>

          <div className="mt-auto flex w-full items-center gap-2">
            <Button className="grow " variant="primary" type="submit">
              Schedule
            </Button>
          </div>
          {formError && <div className="text-rose-400">{formError}</div>}
        </form>
      )}
    />
  )
}
