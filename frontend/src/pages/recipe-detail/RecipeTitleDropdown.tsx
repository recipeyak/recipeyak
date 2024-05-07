import {
  Archive,
  ArchiveRestore,
  CalendarPlus,
  ChefHat,
  ClipboardCopy,
  History,
  NotepadText,
  Pencil,
  Save,
  Trash,
  Upload,
} from "lucide-react"
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
        icon: React.ReactNode
        id: string
        to: string
        onClick?: undefined
        hardNavigate?: boolean
      }
    | {
        type: "menuitem"
        label: string
        icon: React.ReactNode
        id: string
        to?: undefined
        onClick: () => void
      }
    | { type: "separator"; id: string }
  > = [
    {
      type: "menuitem",
      id: "schedule",
      label: "Schedule",
      icon: <CalendarPlus size={16} />,
      onClick: () => {
        setShowScheduleModal(true)
      },
    },
    {
      type: "menuitem",
      id: "cook",
      label: "Start Cooking",
      icon: <ChefHat size={16} />,
      to: pathCookDetail({ recipeId: recipeId.toString() }),
    },
    {
      type: "menuitem",
      id: "copy",
      label: "Copy Ingredients",
      icon: <ClipboardCopy size={16} />,
      onClick: () => {
        const ingredients = recipeIngredients.map(ingredientToString).join("\n")
        copyToClipboard(ingredients)
        toast("Copied ingredients to clipboard!")
      },
    },
    {
      type: "menuitem",
      id: "versions",
      label: "Version History",
      icon: <History size={16} />,
      onClick: () => {
        setShowVersionModal(true)
      },
    },
    {
      type: "menuitem",
      id: "scheduled",
      label: "Schedule History",
      icon: <NotepadText size={16} />,
      to: recipeURL(recipeId, recipeName) + "?timeline=1",
    },
    {
      type: "menuitem",
      id: "edit",
      label: editingEnabled ? "Disable Editing" : "Enable Editing",
      icon: editingEnabled ? <Save size={16} /> : <Pencil size={16} />,
      onClick: toggleEditing,
    },
    {
      type: "separator",
      id: "separator-1",
    },
    {
      type: "menuitem",
      id: "archive",
      label: !isArchived ? "Archive" : "Unarchive",
      icon: !isArchived ? <Archive size={16} /> : <ArchiveRestore size={16} />,
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
      id: "export",
      label: "Export",
      icon: <Upload size={16} />,
      // TODO: pop up a modal and ask for what file export type
      to: pathRecipeDetail({ recipeId: recipeId.toString() }) + ".yaml",
      hardNavigate: true,
    },
    {
      type: "menuitem",
      id: "delete",
      label: "Delete",
      icon: <Trash size={16} />,
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
            const metadata = menuItems.find((x) => x.id === key)
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
              <MenuItem id={menuItem.id} key={menuItem.id} href={menuItem.to}>
                <div className="flex items-center gap-2">
                  {menuItem.icon}
                  {menuItem.label}
                </div>
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
