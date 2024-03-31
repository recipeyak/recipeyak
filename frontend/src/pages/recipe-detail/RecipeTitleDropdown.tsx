import { useState } from "react"
import { Menu, MenuTrigger, Separator } from "react-aria-components"

import { copyToClipboard } from "@/clipboard"
import { Button } from "@/components/Buttons"
import { Chevron } from "@/components/icons"
import { MenuItem } from "@/components/MenuItem"
import { MenuPopover } from "@/components/MenuPopover"
import { Modal } from "@/components/Modal"
import { RecipeVersionModal } from "@/pages/recipe-detail/RecipeVersionModal"
import { ScheduleModal } from "@/pages/recipe-detail/ScheduleModal"
import { pathCookDetail, pathRecipeDetail } from "@/paths"
import { useRecipeDelete } from "@/queries/useRecipeDelete"
import { RecipeFetchResponse as Recipe } from "@/queries/useRecipeFetch"
import { useRecipeUpdate } from "@/queries/useRecipeUpdate"
import { toast } from "@/toast"
import { recipeURL } from "@/urls"

type RecentSchedule = Recipe["recentSchedules"][number]
type Ingredient = Recipe["ingredients"][number]
type Versions = Recipe["versions"]

function ingredientToString(ingre: Ingredient) {
  const s = ingre.quantity.trim() + " " + ingre.name.trim()
  if (ingre.description) {
    return s + ", " + ingre.description.trim()
  }
  return s
}

export function RecipeTitleDropdown({
  recipeId,
  recipeName,
  recipeIsArchived: isArchived,
  recipeIngredients,
  recipeAuthor,
  recipeImageUrl,
  recipeRecentScheduleHistory,
  versions,
  toggleEditing,
  editingEnabled,
}: {
  recipeId: number
  recipeName: string
  versions: Versions
  recipeImageUrl: {
    id: string
    url: string
    backgroundUrl: string | null
  } | null
  recipeAuthor: string | null
  recipeIsArchived: boolean
  recipeIngredients: readonly Ingredient[]
  recipeRecentScheduleHistory: readonly RecentSchedule[]
  toggleEditing: () => void
  editingEnabled: boolean
}) {
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)
  const updateRecipe = useRecipeUpdate()
  const deleteRecipe = useRecipeDelete()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)

  const menuItems: Array<
    | {
        type: "menuitem"
        label: string
        to: string
        onClick?: undefined
        hardNavigate?: boolean
      }
    | { type: "menuitem"; label: string; to?: undefined; onClick: () => void }
    | { type: "separator"; id: string }
  > = [
    {
      type: "menuitem",
      label: "Schedule…",
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
      label: "Version History",
      onClick: () => {
        setShowVersionModal(true)
      },
    },
    {
      type: "menuitem",
      label: "Schedule History",
      to: recipeURL(recipeId, recipeName) + "?timeline=1",
    },
    {
      type: "menuitem",
      label: editingEnabled ? "Disable Editing" : "Enable Editing…",
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
          setIsArchiveModalOpen(true)
        } else {
          // Don't need to confirm for unarchiving
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
      label: "Export",
      // TODO: pop up a modal and ask for what file export type
      to: pathRecipeDetail({ recipeId: recipeId.toString() }) + ".yaml",
      hardNavigate: true,
    },
    {
      type: "menuitem",
      label: "Delete…",
      onClick: () => {
        setIsDeleteModalOpen(true)
      },
    },
  ]

  return (
    <MenuTrigger>
      <Button>
        Actions <Chevron />
      </Button>
      <MenuPopover>
        <Menu
          className="outline-none"
          onAction={(key) => {
            const metadata = menuItems.find(
              (x) => "label" in x && x.label === key,
            )
            if (metadata && "label" in metadata) {
              if (metadata.to && metadata.hardNavigate) {
                // hacky way to get hard navigation for a given link
                location.pathname = metadata.to
              } else {
                metadata.onClick?.()
              }
            }
          }}
        >
          {menuItems.map((menuItem) => {
            if ("type" in menuItem && menuItem.type === "separator") {
              return (
                <Separator
                  id={menuItem.id}
                  key={menuItem.id}
                  className="my-1 h-[1px] bg-[--color-border]"
                />
              )
            }
            return (
              <MenuItem
                id={menuItem.label}
                key={menuItem.label}
                href={menuItem.to}
              >
                {menuItem.label}
              </MenuItem>
            )
          })}
        </Menu>
      </MenuPopover>
      <Modal
        title="Delete Recipe"
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      >
        <div className="flex flex-col gap-2">
          <div>Are you sure you want to delete this recipe?</div>
          <div className="flex gap-2">
            <Button>Cancel</Button>
            <Button
              variant="danger"
              loading={deleteRecipe.isPending}
              onClick={() => {
                deleteRecipe.mutate({ recipeId })
              }}
            >
              {!deleteRecipe.isPending ? "Delete" : "Deleting..."}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        title="Archive Recipe"
        isOpen={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
      >
        <div className="flex flex-col gap-2">
          <div>Are you sure you want to archive this recipe?</div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setIsArchiveModalOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={updateRecipe.isPending}
              onClick={() => {
                void updateRecipe
                  .mutateAsync({
                    recipeId,
                    update: {
                      // TODO: this api should support something like 'now'
                      archived_at: new Date(),
                    },
                  })
                  .then(() => {
                    setIsArchiveModalOpen(false)
                  })
              }}
            >
              {!updateRecipe.isPending ? "Archive" : "Archiving..."}
            </Button>
          </div>
        </div>
      </Modal>
      <RecipeVersionModal
        versions={versions}
        isOpen={showVersionModal}
        onOpenChange={setShowVersionModal}
      />
      <ScheduleModal
        isOpen={showScheduleModal}
        recipeId={recipeId}
        recipeName={recipeName}
        isArchived={isArchived}
        recipeImageUrl={recipeImageUrl}
        recipeAuthor={recipeAuthor}
        scheduleHistory={recipeRecentScheduleHistory}
        onOpenChange={setShowScheduleModal}
      />
    </MenuTrigger>
  )
}
