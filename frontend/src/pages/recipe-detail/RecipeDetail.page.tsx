import { usePresence } from "ably/react"
import { flatten, last, sortBy, uniqBy } from "lodash-es"
import React, { useMemo, useState } from "react"
import { RouteComponentProps, useHistory } from "react-router"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Helmet } from "@/components/Helmet"
import { Image } from "@/components/Image"
import { Loader } from "@/components/Loader"
import { Meta } from "@/components/Meta"
import { NavPage } from "@/components/Page"
import { Tag } from "@/components/Tag"
import { TextInput } from "@/components/TextInput"
import { formatHumanDate } from "@/date"
import {
  getInitialIngredients,
  Mutable,
  SectionsAndIngredients,
} from "@/ingredients"
import * as ordering from "@/ordering"
import AddIngredientOrSection from "@/pages/recipe-detail/AddIngredient"
import AddStep from "@/pages/recipe-detail/AddStep"
import { Gallery } from "@/pages/recipe-detail/ImageGallery"
import { Ingredient } from "@/pages/recipe-detail/Ingredient"
import { NoteContainer } from "@/pages/recipe-detail/Notes"
import { SectionTitle } from "@/pages/recipe-detail/RecipeHelpers"
import { RecipeSource } from "@/pages/recipe-detail/RecipeSource"
import { RecipeTimeline } from "@/pages/recipe-detail/RecipeTimeline"
import { RecipeTitleDropdown } from "@/pages/recipe-detail/RecipeTitleDropdown"
import { Section } from "@/pages/recipe-detail/Section"
import StepContainer from "@/pages/recipe-detail/StepContainer"
import { TagEditor } from "@/pages/recipe-detail/TagEditor"
import { pathRecipeDetail, pathRecipesList } from "@/paths"
import { getNewPosIngredients } from "@/position"
import { useIngredientUpdate } from "@/queries/ingredientUpdate"
import { PickVariant } from "@/queries/queryUtilTypes"
import {
  RecipeFetchResponse as Recipe,
  useRecipeFetch,
} from "@/queries/recipeFetch"
import { useRecipeUpdate } from "@/queries/recipeUpdate"
import { useSectionUpdate } from "@/queries/sectionUpdate"
import { useUserFetch } from "@/queries/userFetch"
import { notEmpty } from "@/text"
import { formatImgOpenGraph } from "@/url"
import { useAddSlugToUrl } from "@/useAddSlugToUrl"
import { useGlobalEvent } from "@/useGlobalEvent"
import { useTeamId } from "@/useTeamId"

type Ingredient = Recipe["ingredients"]

type TimelineItem = Recipe["timelineItems"][number]
type Note = PickVariant<TimelineItem, "note">
type Upload = Note["attachments"][number]

function RecipeDetails({
  recipe,
  editingEnabled,
  openImage,
}: {
  readonly recipe: Recipe
  editingEnabled: boolean
  openImage: (_: string) => void
}) {
  // default to open when in edit mode
  const [addIngredient, setAddIngredient] = React.useState(editingEnabled)
  // default to open when in edit mode
  const [addStep, setAddStep] = React.useState(editingEnabled)
  const [sectionsAndIngredients, setSectionsAndIngredients] =
    React.useState<SectionsAndIngredients>(() => getInitialIngredients(recipe))
  const updateIngredient = useIngredientUpdate()
  const updateSection = useSectionUpdate()
  React.useEffect(() => {
    setSectionsAndIngredients(
      getInitialIngredients({
        sections: recipe.sections,
        ingredients: recipe.ingredients,
      }),
    )
  }, [recipe.ingredients, recipe.sections])

  const handleMove = ({
    from,
    to,
  }: {
    readonly from: number
    readonly to: number
  }) => {
    setSectionsAndIngredients((prev) => {
      const newIngredients = [...prev]
      const item = newIngredients[from]
      newIngredients.splice(from, 1)
      newIngredients.splice(to, 0, item)
      return newIngredients
    })
  }

  const handleCompleteMove = (args: {
    readonly kind: "section" | "ingredient"
    readonly id: number
    readonly to: number
  }) => {
    const newPosition = getNewPosIngredients(sectionsAndIngredients, args.to)
    if (newPosition == null) {
      return
    }
    setSectionsAndIngredients((prev) => {
      const out: Mutable<SectionsAndIngredients> = []
      for (const item of prev) {
        if (item.item.id === args.id) {
          // NOTE(sbdchd): we do this weird `if` to make typescript happy
          if (item.kind === "ingredient") {
            out.push({
              ...item,
              item: {
                ...item.item,
                position: newPosition,
              },
            })
          } else {
            out.push({
              ...item,
              item: {
                ...item.item,
                position: newPosition,
              },
            })
          }
        } else {
          out.push(item)
        }
      }
      return out
    })
    if (args.kind === "ingredient") {
      updateIngredient.mutate({
        recipeId: recipe.id,
        ingredientId: args.id,
        update: {
          position: newPosition,
        },
      })
    } else {
      updateSection.mutate({
        recipeId: recipe.id,
        sectionId: args.id,
        update: {
          position: newPosition,
        },
      })
    }
  }

  const handleHideAddIngredient = () => {
    setAddIngredient(false)
  }
  const handleShowAddIngredient = () => {
    setAddIngredient(true)
  }

  React.useEffect(() => {
    if (!editingEnabled) {
      setAddStep(false)
      setAddIngredient(false)
    }
  }, [editingEnabled])

  const steps = sortBy(recipe.steps, (x) => x.position)

  return (
    <>
      <div>
        <SectionTitle>Ingredients</SectionTitle>
        <ul className={clx(editingEnabled && "mb-2")}>
          {sectionsAndIngredients.map((item, i) => {
            if (item.kind === "ingredient") {
              const ingre = item.item
              return (
                <Ingredient
                  key={"ingredient" + String(ingre.id)}
                  index={i}
                  recipeID={recipe.id}
                  ingredientId={ingre.id}
                  quantity={ingre.quantity}
                  name={ingre.name}
                  isEditing={editingEnabled}
                  description={ingre.description}
                  optional={ingre.optional}
                  completeMove={handleCompleteMove}
                  move={handleMove}
                />
              )
            }
            if (item.kind === "section") {
              const sec = item.item
              return (
                <Section
                  key={"section" + String(sec.id)}
                  recipeId={recipe.id}
                  sectionId={sec.id}
                  title={sec.title}
                  isEditing={editingEnabled}
                  index={i}
                  move={handleMove}
                  completeMove={handleCompleteMove}
                />
              )
            }
          })}
        </ul>
        {addIngredient ? (
          <AddIngredientOrSection
            recipeId={recipe.id}
            onCancel={handleHideAddIngredient}
            newPosition={ordering.positionAfter(
              last(sectionsAndIngredients)?.item.position ??
                ordering.FIRST_POSITION,
            )}
          />
        ) : (
          editingEnabled && (
            <Button
              size="small"
              onClick={handleShowAddIngredient}
              aria-label="open add ingredient"
            >
              Add
            </Button>
          )
        )}
      </div>

      <div>
        <SectionTitle>Preparation</SectionTitle>
        <StepContainer
          steps={steps}
          isEditing={editingEnabled}
          recipeID={recipe.id}
        />
        {addStep ? (
          <AddStep
            recipeId={recipe.id}
            index={steps.length + 1}
            onCancel={() => {
              setAddStep(false)
            }}
            position={ordering.positionAfter(
              last(steps)?.position ?? ordering.FIRST_POSITION,
            )}
          />
        ) : (
          editingEnabled && (
            <Button
              size="small"
              aria-label="open add step"
              onClick={() => {
                setAddStep(true)
              }}
            >
              Add
            </Button>
          )
        )}
        <NoteContainer
          timelineItems={recipe.timelineItems}
          recipeId={recipe.id}
          openImage={openImage}
        />
      </div>
    </>
  )
}

function ArchiveMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-2 rounded-[5px] bg-[--color-background-card] px-3 py-1 font-bold"
      children={children}
    />
  )
}

function RecipeBanner({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="flex items-center">
      <hr className="my-0 grow" />
      <ArchiveMessage>{children}</ArchiveMessage>
      <hr className="my-0 grow" />
    </div>
  )
}

type IRecipeProps = RouteComponentProps<{ recipeId: string }>

function RecipeMetaItem({
  inline,
  children,
  label,
}: {
  inline?: boolean
  children: React.ReactNode
  label: string
}) {
  return (
    // eslint-disable-next-line no-restricted-syntax
    <div style={{ display: "flex", gap: inline ? "0.25rem" : undefined }}>
      <div className="font-bold" style={!inline ? { width: 90 } : undefined}>
        {label}
      </div>
      <div className="cursor-auto select-text">{children}</div>
    </div>
  )
}

function RecipeEditor(props: { recipe: Recipe; onClose: () => void }) {
  const [formState, setFormState] = useState<Partial<Recipe>>(props.recipe)
  const updateRecipe = useRecipeUpdate()
  const onSave = () => {
    updateRecipe.mutate(
      {
        recipeId: props.recipe.id,
        update: {
          name: formState.name,
          author: formState.author,
          time: formState.time,
          tags: formState.tags,
          servings: formState.servings,
          source: formState.source,
        },
      },
      {
        onSuccess: () => {
          props.onClose()
        },
      },
    )
  }

  const setAttr = <T extends keyof Partial<Recipe>>(
    attr: T,
    val: Recipe[T],
  ) => {
    setFormState((s) => ({ ...s, [attr]: val }))
  }

  const handleChange =
    (attr: keyof Partial<Recipe>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setAttr(attr, val)
    }
  return (
    <div>
      <label className="font-bold">
        Title
        <TextInput
          autoFocus
          placeholder="new recipe title"
          onChange={handleChange("name")}
          defaultValue={formState.name}
        />
      </label>
      <label className="font-bold">
        Author
        <TextInput
          placeholder="Author"
          defaultValue={formState.author ?? ""}
          onChange={handleChange("author")}
        />
      </label>
      <label className="font-bold">
        Time
        <TextInput
          placeholder="1 hour"
          defaultValue={formState.time ?? ""}
          onChange={handleChange("time")}
        />
      </label>
      <label className="font-bold">
        Servings
        <TextInput
          placeholder="4 to 6 servings"
          defaultValue={formState.servings ?? ""}
          onChange={handleChange("servings")}
          name="servings"
        />
      </label>
      <label className="font-bold">
        From
        <TextInput
          placeholder="http://example.com/dumpling-soup"
          defaultValue={formState.source ?? ""}
          onChange={handleChange("source")}
          name="source"
        />
      </label>
      <div className="font-bold">
        Tags
        <TagEditor
          tags={formState.tags ?? []}
          onChange={(tags) => {
            setAttr("tags", tags)
          }}
        />
      </div>
      <div className="col-span-full mt-4 flex items-end justify-end">
        <Button
          size="small"
          className="mr-3"
          type="button"
          onClick={props.onClose}
        >
          Cancel
        </Button>
        <Button
          size="small"
          type="submit"
          variant="primary"
          loading={updateRecipe.isPending}
          onClick={onSave}
        >
          Save
        </Button>
      </div>
    </div>
  )
}

function HeaderImgUploader({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[3px] bg-[--color-background-card] p-2 font-[14px] !opacity-100"
      children={children}
    />
  )
}

function useGallery(
  noteUploads: readonly Upload[],
  recipeId: number | null,
  primaryImage: { id: string; url: string; contentType: string } | null,
) {
  const isPrimaryImageInUploads =
    noteUploads.find((x) => x.id === primaryImage?.id) != null
  const uploads: readonly Upload[] = useMemo(() => {
    return isPrimaryImageInUploads || primaryImage == null
      ? noteUploads
      : [
          {
            url: primaryImage.url,
            id: primaryImage.id,
            contentType: primaryImage.contentType,
            backgroundUrl: null,
            isPrimary: true,
            localId: primaryImage.id,
            type: "upload",
          },
          ...noteUploads,
        ]
  }, [isPrimaryImageInUploads, primaryImage, noteUploads])

  const [showGalleryImage, setGalleryImage] = React.useState<{
    id: string
  } | null>(null)
  const image = uploads.find((x) => x.id === showGalleryImage?.id)
  const imagePosition = uploads.findIndex((x) => x.id === showGalleryImage?.id)

  const openImage = React.useCallback((imageId: string) => {
    setGalleryImage({ id: imageId })
  }, [])

  const hasPrevious = imagePosition > 0
  const hasNext = imagePosition < uploads.length - 1

  const updateRecipe = useRecipeUpdate()

  const onPrevious = React.useCallback(() => {
    setGalleryImage({ id: uploads[imagePosition - 1].id })
  }, [imagePosition, uploads])
  const onNext = React.useCallback(() => {
    setGalleryImage({ id: uploads[imagePosition + 1].id })
  }, [imagePosition, uploads])
  const onClose = React.useCallback(() => {
    setGalleryImage(null)
  }, [])
  const onStar = React.useCallback(() => {
    if (image?.id == null || recipeId == null) {
      return
    }
    updateRecipe.mutate({
      recipeId,
      update: {
        primaryImageId: image.isPrimary ? null : image.id,
      },
    })
  }, [recipeId, image?.isPrimary, image?.id, updateRecipe])

  const openPrimaryImage = React.useCallback(() => {
    if (primaryImage?.id != null) {
      openImage(primaryImage.id)
    }
  }, [primaryImage?.id, openImage])

  useGlobalEvent({
    keyDown: (e) => {
      if (showGalleryImage == null) {
        return
      }
      if (e.key === "Escape") {
        onClose()
      }
      if (e.key === "ArrowLeft") {
        onPrevious()
      }
      if (e.key === "ArrowRight") {
        onNext()
      }
    },
  })

  return {
    openImage,
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
    onClose,
    onStar,
    openPrimaryImage,
    image,
  }
}
function isNote(x: TimelineItem): x is Note {
  return x.type === "note"
}

function RecipePresence({
  recipeId,
  user,
}: {
  recipeId: number
  user: { avatar_url: string; id: number }
}) {
  const teamId = useTeamId()
  const { presenceData } = usePresence<{ avatarUrl: string }>(
    {
      channelName: `recipe:${teamId}:${recipeId}`,
    },
    { avatarUrl: user.avatar_url },
  )
  const peers = uniqBy(
    presenceData.filter((msg) => msg.clientId !== user.id.toString()),
    (x) => x.clientId,
  ).map((msg, index) => <Avatar key={index} avatarURL={msg.data.avatarUrl} />)
  return <div className="flex flex-wrap gap-2">{peers}</div>
}

function RecipeInfo(props: {
  recipe: Recipe
  editingEnabled: boolean
  openImage: () => void
  toggleEditMode: () => void
}) {
  const [showEditor, setShowEditor] = useState(false)
  const inlineLayout = !props.recipe.primaryImage && !props.editingEnabled
  const user = useUserFetch()

  return (
    <>
      <div
        className={clx(
          "flex flex-col items-start justify-around gap-2",
          inlineLayout && "md:[grid-area:1_/_span_2]",
        )}
      >
        <div className="flex w-full justify-between pr-4">
          <RecipeTitleDropdown
            recipeIsArchived={props.recipe.archived_at != null}
            recipeId={props.recipe.id}
            recipeAuthor={props.recipe.author}
            recipeImageUrl={props.recipe.primaryImage}
            recipeName={props.recipe.name}
            recipeIngredients={props.recipe.ingredients}
            recipeRecentScheduleHistory={props.recipe.recentSchedules}
            editingEnabled={props.editingEnabled}
            toggleEditing={props.toggleEditMode}
          />
          {user.data && (
            <RecipePresence recipeId={props.recipe.id} user={user.data} />
          )}
        </div>
        {showEditor ? (
          <RecipeEditor
            recipe={props.recipe}
            onClose={() => {
              setShowEditor(false)
            }}
          />
        ) : (
          <>
            <div className="flex grow items-center">
              <div className="flex flex-col gap-2">
                <div className="cursor-auto select-text font-serif text-[2.5rem] leading-10">
                  {props.recipe.name}
                </div>
                {notEmpty(props.recipe.author) && (
                  <div className="cursor-auto select-text">
                    By{" "}
                    <Link
                      to={{
                        pathname: pathRecipesList({}),
                        search: `search='${encodeURIComponent(
                          props.recipe.author,
                        )}'`,
                      }}
                    >
                      {props.recipe.author}
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div
              className={clx(
                "flex flex-wrap gap-y-1",
                inlineLayout ? "gap-x-3" : "flex-col justify-end",
              )}
            >
              {notEmpty(props.recipe.time) && (
                <RecipeMetaItem inline={inlineLayout} label={"Time"}>
                  {props.recipe.time}
                </RecipeMetaItem>
              )}
              {notEmpty(props.recipe.servings) && (
                <RecipeMetaItem inline={inlineLayout} label={"Servings"}>
                  <RecipeSource source={props.recipe.servings} />
                </RecipeMetaItem>
              )}
              {notEmpty(props.recipe.source) && (
                <RecipeMetaItem inline={inlineLayout} label={"From"}>
                  <RecipeSource source={props.recipe.source} />
                </RecipeMetaItem>
              )}
              {(props.recipe.tags?.length ?? 0) > 0 && (
                <RecipeMetaItem inline={inlineLayout} label={"Tags"}>
                  <Box gap={2}>
                    {props.recipe.tags?.map((x) => (
                      <Link
                        key={x}
                        to={{
                          pathname: pathRecipesList({}),
                          search: `search=${encodeURIComponent(`tag:${x}`)}`,
                        }}
                      >
                        <Tag selectable>{x}</Tag>
                      </Link>
                    ))}
                  </Box>
                </RecipeMetaItem>
              )}

              {props.editingEnabled && (
                <Button
                  size="small"
                  type="button"
                  aria-label="edit metadata"
                  onClick={() => {
                    setShowEditor(true)
                  }}
                >
                  Edit
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      {(props.recipe.primaryImage || props.editingEnabled) && (
        <>
          <div className="relative -mx-3 aspect-[3/2] [grid-area:2/1] print:!hidden sm:mx-0 md:[grid-area:1/2]">
            <Image
              sources={props.recipe.primaryImage}
              imgixFmt="large"
              roundDesktop
              onClick={() => {
                props.openImage()
              }}
              loading="eager"
              ariaLabel="open primary image"
            />
            {props.recipe.primaryImage?.author != null && (
              <div className="absolute right-0 mr-2 text-right text-xs font-medium text-[--color-text-muted] sm:mr-0">
                {props.recipe.primaryImage.author}
              </div>
            )}
          </div>
          {props.editingEnabled && (
            <>
              <div className="z-[35] -mx-3 rounded-none bg-[--color-modal-background] [grid-area:2/1] sm:mx-0 sm:rounded-md md:[grid-area:1/2]" />
              <div className="z-[999] flex items-center justify-center [grid-area:2/1] md:[grid-area:1/2]">
                <HeaderImgUploader>
                  <div>Select a primary image from note uploads.</div>
                </HeaderImgUploader>
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}

export function RecipeDetailPage(props: IRecipeProps) {
  const recipeId = parseInt(props.match.params.recipeId, 10)

  const maybeRecipe = useRecipeFetch({ recipeId })
  const history = useHistory()
  const parsed = new URLSearchParams(props.location.search)
  const editingEnabled = parsed.get("edit") === "1"

  useAddSlugToUrl(
    pathRecipeDetail({ recipeId: recipeId.toString() }),
    maybeRecipe.data?.name,
  )

  const myRecipe = maybeRecipe.isSuccess ? maybeRecipe.data : null
  const notes = myRecipe?.timelineItems.filter(isNote) ?? []
  const uploads = flatten(notes.map((x) => x.attachments))

  const {
    openImage,
    hasNext,
    hasPrevious,
    onStar,
    onClose,
    onNext,
    onPrevious,
    image,
    openPrimaryImage,
  } = useGallery(uploads, myRecipe?.id ?? null, myRecipe?.primaryImage ?? null)

  if (maybeRecipe.isPending) {
    return (
      <NavPage>
        <Loader />
      </NavPage>
    )
  }

  if (maybeRecipe.isError) {
    return (
      <NavPage>
        <div className="text-center">recipe not found</div>
      </NavPage>
    )
  }

  const recipe = maybeRecipe.data

  const isTimeline = !!parsed.get("timeline")
  const archivedAt = recipe.archived_at
    ? formatHumanDate(new Date(recipe.archived_at))
    : null

  const toggleEditMode = () => {
    const params = new URLSearchParams(props.location.search)
    if (params.get("edit")) {
      params.delete("edit")
    } else {
      params.set("edit", "1")
    }
    history.push({ search: "?" + params.toString() })
  }

  let recipeTitle = recipe.name
  if (recipe.author) {
    recipeTitle = recipeTitle + ` by ${recipe.author}`
  }

  const enableLargeImageRow = !!recipe.primaryImage?.url || editingEnabled

  return (
    <NavPage>
      <Helmet title={recipe.name} />
      <Meta
        title={recipeTitle}
        image={formatImgOpenGraph(recipe.primaryImage?.url ?? "")}
      />
      {archivedAt != null && <RecipeBanner>Archived {archivedAt}</RecipeBanner>}
      {editingEnabled && (
        <RecipeBanner>
          Editing
          <Button
            size="small"
            type="button"
            className="ml-3"
            aria-label="exit edit mode"
            onClick={toggleEditMode}
          >
            Exit
          </Button>
        </RecipeBanner>
      )}
      {image != null && (
        <Gallery
          imageUrl={image.url}
          isPrimary={image.isPrimary}
          contentType={image.contentType}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onPrevious={onPrevious}
          onNext={onNext}
          onStar={onStar}
          onClose={onClose}
        />
      )}

      <div
        className={clx(
          "mx-auto mt-4 grid max-w-[1000px] grid-cols-1 gap-2 print:!flex print:!flex-col md:[grid-template-columns:minmax(350px,3fr)_5fr]",
          enableLargeImageRow
            ? "[grid-template-rows:auto_auto_auto]"
            : "[grid-template-rows:auto]",
        )}
      >
        <RecipeInfo
          recipe={recipe}
          editingEnabled={editingEnabled}
          toggleEditMode={toggleEditMode}
          openImage={openPrimaryImage}
        />

        {isTimeline ? (
          <RecipeTimeline recipeId={recipe.id} createdAt={recipe.created} />
        ) : (
          <RecipeDetails
            recipe={recipe}
            editingEnabled={editingEnabled}
            openImage={openImage}
          />
        )}
      </div>
    </NavPage>
  )
}
