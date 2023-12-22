import { useState } from "react"
import {
  Button,
  Menu,
  MenuItem,
  MenuItemProps,
  MenuTrigger,
  Popover,
  Separator,
} from "react-aria-components"

import { copyToClipboard } from "@/clipboard"
import { Chevron } from "@/components/icons"
import { ScheduleModal } from "@/pages/recipe-detail/ScheduleModal"
import { pathCookDetail, pathRecipeDetail } from "@/paths"
import { useRecipeDelete } from "@/queries/recipeDelete"
import { IIngredient, RecentSchedule } from "@/queries/recipeFetch"
import { useRecipeUpdate } from "@/queries/recipeUpdate"
import { toast } from "@/toast"

function ingredientToString(ingre: IIngredient) {
  const s = ingre.quantity.trim() + " " + ingre.name.trim()
  if (ingre.description) {
    return s + ", " + ingre.description.trim()
  }
  return s
}

function ActionItem(props: Omit<MenuItemProps, "className">) {
  return (
    <MenuItem
      {...props}
      className={
        "flex cursor-pointer rounded px-2 py-1 [transition:background_.12s_ease-out] hover:bg-[var(--color-border)] focus-visible:outline-[3px] focus-visible:-outline-offset-2 focus-visible:outline-[rgb(47,129,247)] "
      }
    />
  )
}

export function Dropdown({
  recipeId,
  recipeName,
  recipeIsArchived: isArchived,
  recipeIngredients,
  recipeRecentScheduleHistory,
  toggleEditing,
  editingEnabled,
}: {
  recipeId: number
  recipeName: string
  recipeIsArchived: boolean
  recipeIngredients: readonly IIngredient[]
  recipeRecentScheduleHistory: readonly RecentSchedule[]
  toggleEditing: () => void
  editingEnabled: boolean
}) {
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const updateRecipe = useRecipeUpdate()
  const deleteRecipe = useRecipeDelete()

  const menuItems: Array<
    | { type: "menuitem"; label: string; to: string; onClick?: undefined }
    | { type: "menuitem"; label: string; to?: undefined; onClick: () => void }
    | { type: "separator"; id: string }
  > = [
    {
      type: "menuitem",
      label: "Schedule",
      onClick: () => {
        setShowScheduleModal(true)
      },
    },
    {
      type: "menuitem",
      label: "Start Cooking",
      to: pathCookDetail({ recipeId: recipeId.toString() }),
    },
    {
      type: "menuitem",
      label: "Copy Ingredients",
      onClick: () => {
        const ingredients = recipeIngredients.map(ingredientToString).join("\n")
        copyToClipboard(ingredients)
        toast("Copied ingredients to clipboard!")
      },
    },
    {
      type: "menuitem",
      label: "View Timeline",
      to: pathRecipeDetail({ recipeId: recipeId.toString() }) + "?timeline=1",
    },
    {
      type: "menuitem",
      label: editingEnabled ? "Disable Editing" : "Enable Editing",
      onClick: toggleEditing,
    },
    {
      type: "separator",
      id: "separator-1",
    },
    {
      type: "menuitem",
      label: !isArchived ? "Archive" : "Unarchive",
      onClick: () => {
        if (!isArchived) {
          if (confirm("Are you sure you want to archive this recipe?")) {
            updateRecipe.mutate(
              {
                recipeId,
                update: {
                  // TODO: this api should support something like 'now'
                  archived_at: new Date().toISOString(),
                },
              },
              {
                onSuccess: () => {},
              },
            )
          }
        } else {
          updateRecipe.mutate(
            {
              recipeId,
              update: {
                archived_at: null,
              },
            },
            {
              onSuccess: () => {},
            },
          )
        }
      },
    },
    {
      type: "menuitem",
      label: !deleteRecipe.isPending ? "Delete" : "Deleting...",
      onClick: () => {
        if (confirm("Are you sure you want to delete this recipe?")) {
          deleteRecipe.mutate({ recipeId })
        }
      },
    },
  ]

  return (
    <MenuTrigger>
      <Button className="inline-flex cursor-pointer items-center justify-center rounded-md border border-solid border-[var(--color-border)] bg-[var(--color-background-card)] p-0 px-3 py-1 text-sm font-medium text-[var(--color-text)] focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-2 focus-visible:outline-[rgb(47,129,247)]">
        Actions <Chevron />
      </Button>
      <Popover className="w-56 origin-top-left overflow-auto rounded-md border border-solid border-[var(--color-border)] bg-[var(--color-background-calendar-day)] p-2 shadow-lg outline-none">
        <Menu
          className="outline-none"
          onAction={(key) => {
            const metadata = menuItems.find(
              (x) => "label" in x && x.label === key,
            )
            if (metadata && "label" in metadata) {
              metadata.onClick?.()
            }
          }}
        >
          {menuItems.map((menuItem) => {
            if ("type" in menuItem && menuItem.type === "separator") {
              return (
                <Separator
                  id={menuItem.id}
                  key={menuItem.id}
                  className="my-1 h-[1px] bg-[var(--color-border)]"
                />
              )
            }
            return (
              <ActionItem
                id={menuItem.label}
                key={menuItem.label}
                href={menuItem.to}
              >
                {menuItem.label}
              </ActionItem>
            )
          })}
        </Menu>
      </Popover>
      {showScheduleModal && (
        <ScheduleModal
          recipeId={recipeId}
          recipeName={recipeName}
          scheduleHistory={recipeRecentScheduleHistory}
          onClose={() => {
            setShowScheduleModal(false)
          }}
        />
      )}
    </MenuTrigger>
  )
}
