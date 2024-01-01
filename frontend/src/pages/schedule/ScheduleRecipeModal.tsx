import { parseISO } from "date-fns"
import { useState } from "react"

import { Button } from "@/components/Buttons"
import { DateInput, SearchInput } from "@/components/Forms"
import { Modal } from "@/components/Modal"
import { toISODateString } from "@/date"
import { useScheduleRecipeCreate } from "@/queries/scheduledRecipeCreate"
import { useSearchQuery } from "@/queries/searchRecipes"
import { imgixFmt } from "@/url"

function RecipeSelectInput({
  onSelect,
}: {
  onSelect: (_: RecipeSearchItem) => void
}) {
  const [query, setQuery] = useState("")
  const data = useSearchQuery(query)
  return (
    <div className="flex flex-col gap-2">
      <SearchInput
        placeholder="search recipes"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
        }}
      />
      <div className="flex max-h-[300px] flex-col gap-1 overflow-auto">
        {data.data?.length === 0 && query.length !== 0 ? (
          <div className="text-center">no results</div>
        ) : (
          data.data?.map((item) => {
            return (
              <RecipeItem
                key={item.id}
                src={
                  item.primary_image?.url != null
                    ? imgixFmt(item.primary_image.url)
                    : ""
                }
                name={item.name}
                author={item.author ?? ""}
                onClick={() => {
                  onSelect(item)
                }}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

function RecipeItem({
  src,
  name,
  author,
  onClick,
}: {
  src: string
  name: string
  author: string
  onClick?: () => void
}) {
  const cls =
    "h-[40px] w-[40px] rounded-md bg-[var(--color-background-empty-image)] object-cover"
  return (
    <div
      className="flex cursor-pointer items-center gap-2"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onClick?.()
        }
      }}
      tabIndex={0}
    >
      {src !== "" ? <img src={src} className={cls} /> : <div className={cls} />}
      <div>
        <div className="line-clamp-1 text-ellipsis">{name}</div>
        <div className="line-clamp-1 text-ellipsis text-sm">{author}</div>
      </div>
    </div>
  )
}

type RecipeSearchItem = {
  readonly id: number
  readonly name: string
  readonly author: string | null
  readonly primary_image: {
    readonly url: string
    readonly background_url: string | null
  } | null
}

function RecipeSelect({
  value,
  onSelect,
}: {
  value: RecipeSearchItem | undefined
  onSelect: (_: RecipeSearchItem | undefined) => void
}) {
  return (
    <div className="flex w-full flex-col gap-1">
      <div className="text-sm">Recipe</div>
      {value != null ? (
        <div className="flex w-full items-center justify-between gap-4">
          <RecipeItem
            key={value.id}
            src={
              value.primary_image?.url != null
                ? imgixFmt(value.primary_image.url)
                : ""
            }
            name={value.name}
            author={value.author ?? ""}
          />
          <Button
            size="small"
            onClick={() => {
              onSelect(undefined)
            }}
          >
            change
          </Button>
        </div>
      ) : (
        <RecipeSelectInput
          onSelect={(item) => {
            onSelect(item)
          }}
        />
      )}
    </div>
  )
}

export function ScheduleRecipeModal({
  onClose,
  defaultValue,
}: {
  onClose: () => void
  defaultValue?: string
}) {
  const [isoDate, setIsoDate] = useState(
    defaultValue ?? toISODateString(new Date()),
  )
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsoDate(e.target.value)
  }
  const [selectedItem, setSelectedItem] = useState<RecipeSearchItem>()
  const scheduledRecipeCreate = useScheduleRecipeCreate()
  const handleSubmit = () => {
    if (selectedItem == null) {
      return
    }
    scheduledRecipeCreate.mutate({
      recipeID: selectedItem.id,
      recipeName: selectedItem.name,
      on: parseISO(isoDate),
    })
    onClose()
  }
  return (
    <Modal
      show
      onClose={onClose}
      title="Schedule a Recipe"
      content={
        <form
          className="flex flex-col items-start gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <RecipeSelect onSelect={setSelectedItem} value={selectedItem} />

          <label className="flex w-full flex-col gap-1">
            <div className="text-sm">Date</div>
            <DateInput value={isoDate} onChange={handleDateChange} />
          </label>

          <div className="flex w-full items-center gap-2">
            <Button
              size="small"
              className="grow "
              type="submit"
              disabled={selectedItem == null}
            >
              Schedule
            </Button>
          </div>
        </form>
      }
    />
  )
}