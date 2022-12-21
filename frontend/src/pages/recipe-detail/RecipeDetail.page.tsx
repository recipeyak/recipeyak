import produce from "immer"
import { flatten, groupBy, last, pick, sortBy } from "lodash-es"
import queryString from "query-string"
import React, { useMemo, useState } from "react"
import { RouteComponentProps, useHistory } from "react-router"
import { Link, useLocation } from "react-router-dom"

import * as api from "@/api"
import { Button } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { Loader } from "@/components/Loader"
import { formatHumanDate } from "@/date"
import {
  useDispatch,
  useGlobalEvent,
  useOnWindowFocusChange,
  useSelector,
} from "@/hooks"
import * as ordering from "@/ordering"
import AddIngredientOrSection from "@/pages/recipe-detail/AddIngredient"
import AddStep from "@/pages/recipe-detail/AddStep"
import { Gallery } from "@/pages/recipe-detail/ImageGallery"
import { Ingredient } from "@/pages/recipe-detail/Ingredient"
import { NoteContainer } from "@/pages/recipe-detail/Notes"
import { SectionTitle } from "@/pages/recipe-detail/RecipeHelpers"
import { RecipeTimeline } from "@/pages/recipe-detail/RecipeTimeline"
import { Dropdown } from "@/pages/recipe-detail/RecipeTitleDropdown"
import { Section } from "@/pages/recipe-detail/Section"
import StepContainer from "@/pages/recipe-detail/StepContainer"
import { TagEditor } from "@/pages/recipe-detail/TagEditor"
import { getNewPosIngredients } from "@/position"
import { isOk } from "@/result"
import {
  deleteIngredient,
  fetchRecipe,
  getRecipeById,
  IIngredient,
  INote,
  IRecipe,
  patchRecipe,
  TimelineItem,
  updateIngredient,
  updateSectionForRecipe,
  updatingRecipeAsync,
  Upload,
} from "@/store/reducers/recipes"
import { styled } from "@/theme"
import { recipeURL } from "@/urls"
import { pathNamesEqual } from "@/utils/url"
import { isFailure, isInitial, isLoading, isSuccessLike } from "@/webdata"

type SectionsAndIngredients = ReadonlyArray<
  | {
      readonly kind: "ingredient"
      readonly item: IIngredient
    }
  | {
      readonly kind: "section"
      readonly item: {
        readonly id: number
        readonly title: string
        readonly position: string
      }
    }
>
// from https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#improved-control-over-mapped-type-modifiers
type Mutable<T> = { -readonly [P in keyof T]-?: T[P] }

function getInitialIngredients({
  sections,
  ingredients,
}: Pick<IRecipe, "sections" | "ingredients">): SectionsAndIngredients {
  const out: Mutable<SectionsAndIngredients> = []
  for (const s of sections) {
    out.push({
      kind: "section" as const,
      item: s,
    })
  }
  for (const i of ingredients) {
    out.push({
      kind: "ingredient" as const,
      item: i,
    })
  }
  return sortBy(out, (x) => x.item.position)
}

function RecipeDetails({
  recipe,
  editingEnabled,
  openImage,
}: {
  readonly recipe: IRecipe
  editingEnabled: boolean
  openImage: (_: string) => void
}) {
  // default to open when in edit mode
  const [addIngredient, setAddIngredient] = React.useState(editingEnabled)
  // default to open when in edit mode
  const [addStep, setAddStep] = React.useState(editingEnabled)
  const dispatch = useDispatch()
  const [sectionsAndIngredients, setSectionsAndIngredients] =
    React.useState<SectionsAndIngredients>(() => getInitialIngredients(recipe))
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
      dispatch(
        updateIngredient.request({
          recipeID: recipe.id,
          ingredientID: args.id,
          content: { position: newPosition },
        }),
      )
    } else {
      void api
        .updateSection({ sectionId: args.id, position: newPosition })
        .then((res) => {
          if (isOk(res)) {
            dispatch(
              updateSectionForRecipe({
                recipeId: recipe.id,
                sectionId: args.id,
                position: newPosition,
              }),
            )
          }
        })
    }
  }

  const handleHideAddIngredient = () => {
    setAddIngredient(false)
  }
  const handleShowAddIngredient = () => {
    setAddIngredient(true)
  }

  const handleRemove = ({ ingredientId }: { readonly ingredientId: number }) =>
    dispatch(
      deleteIngredient.request({
        recipeID: recipe.id,
        ingredientID: ingredientId,
      }),
    )

  const handleUpdate = ({
    ingredientId,
    ...ingredient
  }: {
    readonly ingredientId: number
    readonly quantity: string
    readonly name: string
    readonly description: string
    readonly optional: boolean
  }) =>
    dispatch(
      updateIngredient.request({
        recipeID: recipe.id,
        ingredientID: ingredientId,
        content: ingredient,
      }),
    )

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
        <ul>
          {sectionsAndIngredients.map((item, i) => {
            if (item.kind === "ingredient") {
              const ingre = item.item
              return (
                <Ingredient
                  key={"ingredient" + String(ingre.id)}
                  index={i}
                  recipeID={recipe.id}
                  id={ingre.id}
                  quantity={ingre.quantity}
                  name={ingre.name}
                  update={handleUpdate}
                  remove={handleRemove}
                  updating={ingre.updating}
                  isEditing={editingEnabled}
                  removing={ingre.removing}
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
            addingIngredient={!!recipe.addingIngredient}
            onCancel={handleHideAddIngredient}
            newPosition={ordering.positionAfter(
              last(sectionsAndIngredients)?.item.position ??
                ordering.FIRST_POSITION,
            )}
          />
        ) : (
          editingEnabled && (
            <a className="text-muted" onClick={handleShowAddIngredient}>
              add
            </a>
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
            id={recipe.id}
            index={steps.length + 1}
            step={recipe.draftStep}
            onCancel={() => {
              setAddStep(false)
            }}
            loading={recipe.addingStepToRecipe}
            position={ordering.positionAfter(
              last(steps)?.position ?? ordering.FIRST_POSITION,
            )}
          />
        ) : (
          editingEnabled && (
            <a
              className="text-muted"
              onClick={() => {
                setAddStep(true)
              }}
            >
              add
            </a>
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

export function useRecipe(recipeId: number) {
  const dispatch = useDispatch()
  const fetch = React.useCallback(
    (refresh?: boolean) => {
      dispatch(fetchRecipe.request({ recipeId, refresh }))
    },
    [dispatch, recipeId],
  )
  React.useEffect(() => {
    fetch()
  }, [fetch])
  const refreshData = React.useCallback(() => {
    fetch(true)
  }, [fetch])
  useOnWindowFocusChange(refreshData)
  return useSelector((state) => getRecipeById(state, recipeId))
}

const ArchiveMessage = styled.div`
  background: whitesmoke;
  font-weight: bold;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  border-radius: 5px;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
`

function RecipeBanner({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="d-flex align-items-center">
      <hr className="flex-grow mb-0 mt-0" />
      <ArchiveMessage>{children}</ArchiveMessage>
      <hr className="flex-grow mb-0 mt-0" />
    </div>
  )
}

/** On load, update the recipe URL to include the slugified recipe name */
function useRecipeUrlUpdate(recipe: { id: number; name: string } | null) {
  const location = useLocation()
  const history = useHistory()

  const { id: recipeId, name: recipeName } = recipe || {}

  React.useEffect(() => {
    if (recipeId == null || recipeName == null) {
      return
    }
    const pathname = recipeURL(recipeId, recipeName)
    if (pathNamesEqual(location.pathname, pathname)) {
      return
    }
    history.replace({ pathname, search: location.search })
  }, [history, history.replace, location, recipeId, recipeName])
}

type IRecipeProps = RouteComponentProps<{ id: string }>

function updateOrCreateTag(
  metaTags: HTMLMetaElement[],
  property: string,
  value: string,
) {
  if (!value) {
    metaTags.forEach((x) => {
      x.remove()
    })
    return
  }
  if (metaTags.length > 0) {
    if (metaTags[0].content !== value) {
      metaTags[0].content = value
    }
    // clear out any dupe tags
    if (metaTags.length > 1) {
      metaTags.forEach((x, i) => {
        // we only want one metatag
        if (i > 0) {
          x.remove()
        }
      })
    }
  } else {
    // setup the missing metatag
    const metaTag = document.createElement("meta")
    // NOTE: property is missing from the type
    metaTag.setAttribute("property", property)
    metaTag.content = value
    document.head.appendChild(metaTag)
  }
}

function Meta({ title, image }: { title: string; image: string }) {
  React.useEffect(() => {
    const metaTags = document.querySelectorAll<HTMLMetaElement>(
      `meta[property^="og:"]`,
    )
    const groupedMetatags = groupBy(metaTags, (x) => x.getAttribute("property"))

    updateOrCreateTag(groupedMetatags["og:title"] || [], "og:title", title)
    updateOrCreateTag(groupedMetatags["og:image"] || [], "og:image", image)
  }, [title, image])
  return null
}

const HeaderImg = styled.img`
  border-radius: 6px;
  height: 100%;
  object-fit: cover;
  width: 100%;
  @media (min-width: 800px) {
    height: 100%;
    grid-area: 1 / 2;
  }
  @media (max-width: 799px) {
    height: 100%;
    grid-area: 2 / 1;
  }
`

const MyRecipeTitle = styled.div`
  font-size: 2.5rem;
  line-height: 1em;
  font-family: Georgia, serif;
`

const RecipeMetaItem = styled.div<{ inline?: boolean }>`
  ${(props) =>
    props.inline
      ? `
  display: flex;
  gap: 0.25rem;
  `
      : `
  display: grid;
  grid-template-columns: 90px 1fr;
`}
`

const RecipeDetailsContainer = styled.div<{ spanColumns?: boolean }>`
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  justify-content: space-around;

  @media (min-width: 800px) {
    ${(props) => (props.spanColumns ? "grid-area: 1 / span 2;" : "")}
  }
`

const RecipeMetaContainer = styled.div<{ inline?: boolean }>`
  display: flex;

  flex-wrap: wrap;
  grid-row-gap: 4px;
  ${(props) =>
    props.inline
      ? `column-gap: 0.75rem;`
      : `flex-direction: column;
  justify-content: end;`}
`

const allowedKeys = [
  "name",
  "author",
  "time",
  "tags",
  "servings",
  "source",
] as const

function RecipeEditor(props: { recipe: IRecipe; onClose: () => void }) {
  const dispatch = useDispatch()
  const [formState, setFormState] = useState<Partial<IRecipe>>(props.recipe)
  const [isSaving, setIsSaving] = useState(false)
  const onSave = async () => {
    setIsSaving(true)
    await updatingRecipeAsync(
      {
        data: pick(formState, allowedKeys),
        id: props.recipe.id,
      },
      dispatch,
    )
    setIsSaving(false)
    props.onClose()
  }

  const setAttr = <T extends keyof Partial<IRecipe>>(
    attr: T,
    val: IRecipe[T],
  ) => {
    setFormState((s) => ({ ...s, [attr]: val }))
  }

  const handleChange =
    (attr: keyof Partial<IRecipe>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setAttr(attr, val)
    }
  return (
    <div>
      <label className="bold">
        Title
        <TextInput
          autoFocus
          placeholder="new recipe title"
          onChange={handleChange("name")}
          defaultValue={formState.name}
        />
      </label>
      <label className="bold">
        Author
        <TextInput
          placeholder="Author"
          defaultValue={formState.author ?? ""}
          onChange={handleChange("author")}
        />
      </label>
      <label className="bold">
        Time
        <TextInput
          placeholder="1 hour"
          defaultValue={formState.time ?? ""}
          onChange={handleChange("time")}
        />
      </label>
      <label className="bold">
        Servings
        <TextInput
          placeholder="4 to 6 servings"
          defaultValue={formState.servings ?? ""}
          onChange={handleChange("servings")}
          name="servings"
        />
      </label>
      <label className="bold">
        From
        <TextInput
          placeholder="http://example.com/dumpling-soup"
          defaultValue={formState.source ?? ""}
          onChange={handleChange("source")}
          name="source"
        />
      </label>
      <div className="bold">
        Tags
        <TagEditor
          tags={formState.tags ?? []}
          onChange={(tags) => {
            setAttr("tags", tags)
          }}
        />
      </div>
      <div className="d-flex grid-entire-row align-items-end justify-content-end mt-4">
        <Button
          size="small"
          className="mr-3"
          type="button"
          name="cancel recipe update"
          onClick={props.onClose}
        >
          Cancel
        </Button>
        <Button
          size="small"
          type="submit"
          variant="primary"
          loading={isSaving}
          onClick={onSave}
          name="save recipe"
        >
          Save
        </Button>
      </div>
    </div>
  )
}

const RecipeTitleCenter = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
`

const isURL = (x: string): boolean => !x.includes(" ") && x.includes(".")

/**
 * Extract a hostname from a URL
 *
 * Example:
 *  https://cooking.nytimes.com/recipes/112390-some-example => cooking.nytimes.com
 */
function URLToDomain({ children: url }: { children: string }) {
  // Extract cooking.nytimes.com from https://cooking.nytimes.com/recipes/112390-some-example
  const regex = /^(https?:\/\/)?([a-zA-z-.]+)/gm
  const x = regex.exec(url)
  if (x) {
    // Our match is in the second capture group
    const secondGroup: string | undefined = x[2]
    if (secondGroup) {
      return <>{secondGroup}</>
    }
  }
  return <>{url}</>
}

function SourceLink({ children }: { children: string }) {
  return (
    <a href={children}>
      <URLToDomain>{children}</URLToDomain>
    </a>
  )
}

const HeaderBgOverlay = styled.div`
  opacity: 0.8;
  border-radius: 6px;
  background: #000;

  @media (min-width: 800px) {
    grid-area: 1 / 2;
  }
  @media (max-width: 799px) {
    grid-area: 2 / 1;
  }
`
const HeaderImgOverlay = styled.div`
  @media (max-width: 799px) {
    grid-area: 2 / 1;
  }
  @media (min-width: 800px) {
    grid-area: 1 / 2;
  }

  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`

const HeaderImgUploader = styled.div`
  background: white;
  opacity: 1 !important;
  padding: 0.5rem;
  border-radius: 3px;
  font-size: 14px;
`

const notEmpty = (x?: string | null): x is string => x !== "" && x != null

const RecipeTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`
function toggleImageStar(recipeId: number, imageId: string) {
  return patchRecipe({
    recipeId,
    updateFn: produce((recipe) => {
      recipe.timelineItems.forEach((timelineItem) => {
        if (timelineItem.type === "note") {
          timelineItem.attachments.forEach((attachment) => {
            if (attachment.id === imageId) {
              attachment.isPrimary = !attachment.isPrimary
            }
          })
        }
      })
      return recipe
    }),
  })
}

function useGallery(
  noteUploads: Upload[],
  recipeId: number | null,
  primaryImage: { id: string; url: string } | null,
) {
  const isPrimaryImageInUploads =
    noteUploads.find((x) => x.id === primaryImage?.id) != null
  const uploads: Upload[] = useMemo(() => {
    return isPrimaryImageInUploads || primaryImage == null
      ? noteUploads
      : [
          {
            url: primaryImage.url,
            id: primaryImage.id,
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
  const dispatch = useDispatch()
  const image = uploads.find((x) => x.id === showGalleryImage?.id)
  const imagePosition = uploads.findIndex((x) => x.id === showGalleryImage?.id)

  const openImage = React.useCallback((imageId: string) => {
    setGalleryImage({ id: imageId })
  }, [])

  const hasPrevious = imagePosition > 0
  const hasNext = imagePosition < uploads.length - 1

  const onPrevious = React.useCallback(() => {
    setGalleryImage({ id: uploads[imagePosition - 1].id })
  }, [imagePosition, uploads])
  const onNext = React.useCallback(() => {
    setGalleryImage({ id: uploads[imagePosition + 1].id })
  }, [imagePosition, uploads])
  const onClose = React.useCallback(() => {
    setGalleryImage(null)
  }, [])
  const onStar = React.useCallback(async () => {
    if (image?.id == null || recipeId == null) {
      return
    }

    dispatch(toggleImageStar(recipeId, image.id))

    const res = await updatingRecipeAsync(
      {
        id: recipeId,
        data: { primaryImageId: image.isPrimary ? null : image.id },
      },
      dispatch,
    )
    if (!isOk(res)) {
      dispatch(toggleImageStar(recipeId, image.id))
    }
  }, [recipeId, image?.isPrimary, image?.id, dispatch])

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
function isNote(x: TimelineItem): x is INote {
  return x.type === "note"
}

function RecipeInfo(props: {
  recipe: IRecipe
  editingEnabled: boolean
  openImage: () => void
  toggleEditMode: () => void
}) {
  const [showEditor, setShowEditor] = useState(false)
  const inlineLayout = !props.recipe.primaryImage && !props.editingEnabled

  return (
    <>
      <RecipeDetailsContainer spanColumns={inlineLayout}>
        <Dropdown
          className="mr-auto"
          recipeId={props.recipe.id}
          editingEnabled={props.editingEnabled}
          toggleEditing={props.toggleEditMode}
          toggleScheduling={() => {}}
        />
        {showEditor ? (
          <RecipeEditor
            recipe={props.recipe}
            onClose={() => {
              setShowEditor(false)
            }}
          />
        ) : (
          <>
            <RecipeTitleCenter>
              <RecipeTitleContainer>
                <MyRecipeTitle>{props.recipe.name}</MyRecipeTitle>
                {notEmpty(props.recipe.author) && (
                  <div className="selectable">
                    By{" "}
                    <Link
                      to={`/recipes?search=author:'${encodeURIComponent(
                        props.recipe.author,
                      )}'`}
                    >
                      {props.recipe.author}
                    </Link>
                  </div>
                )}
              </RecipeTitleContainer>
            </RecipeTitleCenter>
            <RecipeMetaContainer inline={inlineLayout}>
              {notEmpty(props.recipe.time) && (
                <RecipeMetaItem inline={inlineLayout}>
                  <div className="bold">Time</div>
                  <div>{props.recipe.time}</div>
                </RecipeMetaItem>
              )}
              {notEmpty(props.recipe.servings) && (
                <RecipeMetaItem inline={inlineLayout}>
                  <div className="bold">Servings</div>
                  <div>{props.recipe.servings}</div>
                </RecipeMetaItem>
              )}
              {notEmpty(props.recipe.source) && (
                <RecipeMetaItem inline={inlineLayout}>
                  <div className="bold">From</div>
                  <div>
                    {isURL(props.recipe.source) ? (
                      <SourceLink>{props.recipe.source}</SourceLink>
                    ) : (
                      props.recipe.source
                    )}
                  </div>
                </RecipeMetaItem>
              )}
              {(props.recipe.tags?.length ?? 0) > 0 && (
                <RecipeMetaItem inline={inlineLayout}>
                  <div className="bold">Tags</div>
                  <div>
                    {props.recipe.tags?.map((x) => (
                      <Link
                        key={x}
                        to={{
                          pathname: "/recipes",
                          search: `search=${encodeURIComponent(`tag:${x}`)}`,
                        }}
                        className="tag mr-2"
                      >
                        {x}
                      </Link>
                    ))}
                  </div>
                </RecipeMetaItem>
              )}

              {props.editingEnabled && (
                <Button
                  size="small"
                  type="button"
                  onClick={() => {
                    setShowEditor(true)
                  }}
                >
                  Edit
                </Button>
              )}
            </RecipeMetaContainer>
          </>
        )}
      </RecipeDetailsContainer>
      {(props.recipe.primaryImage || props.editingEnabled) && (
        <>
          <HeaderImg
            src={props.recipe.primaryImage?.url ?? ""}
            onClick={() => {
              props.openImage()
            }}
          />
          {props.editingEnabled && (
            <>
              <HeaderBgOverlay />
              <HeaderImgOverlay>
                <HeaderImgUploader>
                  <div>Select a primary image from note uploads.</div>
                </HeaderImgUploader>
              </HeaderImgOverlay>
            </>
          )}
        </>
      )}
    </>
  )
}

const RecipeDetailGrid = styled.div<{ enableLargeImageRow: boolean }>`
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 1rem;

  display: grid;
  gap: 0.5rem;

  @media (max-width: 799px) {
    grid-template-rows: ${(props) =>
      props.enableLargeImageRow ? " auto 470px auto" : "auto"};
    grid-template-columns: 1fr;
  }

  @media (min-width: 800px) {
    grid-template-rows: ${(props) =>
      props.enableLargeImageRow ? "470px auto auto" : "auto"};
    grid-template-columns: minmax(350px, 3fr) 5fr;
  }
`

export function Recipe(props: IRecipeProps) {
  const recipeId = parseInt(props.match.params.id, 10)

  const maybeRecipe = useRecipe(recipeId)
  const history = useHistory()
  const parsed = queryString.parse(props.location.search)
  const editingEnabled = parsed.edit === "1"

  // default to metadata being in edit mode when the page is naved to with edit=1
  useRecipeUrlUpdate(
    isSuccessLike(maybeRecipe)
      ? { id: maybeRecipe.data.id, name: maybeRecipe.data.name }
      : null,
  )
  const myRecipe = isSuccessLike(maybeRecipe) ? maybeRecipe.data : null
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

  if (isInitial(maybeRecipe) || isLoading(maybeRecipe)) {
    return <Loader />
  }

  if (isFailure(maybeRecipe)) {
    return <p>recipe not found</p>
  }

  const recipe = maybeRecipe.data

  const isTimeline = !!parsed.timeline
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

  return (
    <div className="gap-2 mx-auto mw-1000px">
      <Helmet title={recipe.name} />
      <Meta title={recipeTitle} image={recipe.primaryImage?.url ?? ""} />
      {archivedAt != null && <RecipeBanner>Archived {archivedAt}</RecipeBanner>}
      {editingEnabled && (
        <RecipeBanner>
          Editing
          <Button
            size="small"
            type="button"
            name="toggle add section"
            className="ml-3"
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
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onPrevious={onPrevious}
          onNext={onNext}
          onStar={onStar}
          enableStarButton={true}
          onClose={onClose}
        />
      )}

      <RecipeDetailGrid
        enableLargeImageRow={!!recipe.primaryImage?.url || editingEnabled}
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
      </RecipeDetailGrid>
    </div>
  )
}

export default Recipe
