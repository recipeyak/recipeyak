import { flatten, groupBy, last, sortBy } from "lodash-es"
import React, { useMemo, useState } from "react"
import { RouteComponentProps, useHistory } from "react-router"
import { Link, useLocation } from "react-router-dom"

import { IIngredient, INote, IRecipe, TimelineItem, Upload } from "@/api"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { Image } from "@/components/Image"
import { Loader } from "@/components/Loader"
import { formatHumanDate } from "@/date"
import { useGlobalEvent } from "@/hooks"
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
import { useIngredientUpdate } from "@/queries/ingredientUpdate"
import { useRecipeFetch } from "@/queries/recipeFetch"
import { useRecipeUpdate } from "@/queries/recipeUpdate"
import { useSectionUpdate } from "@/queries/sectionUpdate"
import { styled } from "@/theme"
import { recipeURL } from "@/urls"
import { imgixFmt, pathNamesEqual } from "@/utils/url"

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
        <ul>
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
            <Button size="small" onClick={handleShowAddIngredient}>
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
  }, [history, location, recipeId, recipeName])
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

const ImageWrapper = styled.div`
  @media (min-width: 800px) {
    grid-area: 1 / 2;
  }
  @media (max-width: 799px) {
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

function RecipeEditor(props: { recipe: IRecipe; onClose: () => void }) {
  const [formState, setFormState] = useState<Partial<IRecipe>>(props.recipe)
  const updateRecipe = useRecipeUpdate()
  const onSave = async () => {
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
          loading={updateRecipe.isLoading}
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
  z-index: 35;

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
  const onStar = React.useCallback(async () => {
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
          recipeIsArchived={props.recipe.archived_at != null}
          recipeId={props.recipe.id}
          recipeName={props.recipe.name}
          recipeIngredients={props.recipe.ingredients}
          editingEnabled={props.editingEnabled}
          toggleEditing={props.toggleEditMode}
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
                <MyRecipeTitle className="selectable">
                  {props.recipe.name}
                </MyRecipeTitle>
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
                  <div className="selectable">{props.recipe.time}</div>
                </RecipeMetaItem>
              )}
              {notEmpty(props.recipe.servings) && (
                <RecipeMetaItem inline={inlineLayout}>
                  <div className="bold">Servings</div>
                  <div className="selectable">{props.recipe.servings}</div>
                </RecipeMetaItem>
              )}
              {notEmpty(props.recipe.source) && (
                <RecipeMetaItem inline={inlineLayout}>
                  <div className="bold">From</div>
                  <div className="selectable">
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
                  <Box gap={2}>
                    {props.recipe.tags?.map((x) => (
                      <Link
                        key={x}
                        to={{
                          pathname: "/recipes",
                          search: `search=${encodeURIComponent(`tag:${x}`)}`,
                        }}
                        className="tag selectable"
                      >
                        {x}
                      </Link>
                    ))}
                  </Box>
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
          <ImageWrapper style={{ position: "relative" }}>
            <Image
              sources={{
                url: imgixFmt(props.recipe.primaryImage?.url ?? ""),
                backgroundUrl: props.recipe.primaryImage?.backgroundUrl ?? "",
              }}
              rounded
              onClick={() => {
                props.openImage()
              }}
              loading="eager"
            />
            {props.recipe.primaryImage?.author != null && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  textAlign: "right",
                  fontSize: 12,
                  fontWeight: 500,
                }}
                className="text-muted"
              >
                {props.recipe.primaryImage.author}
              </div>
            )}
          </ImageWrapper>
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
      props.enableLargeImageRow ? " auto 300px auto" : "auto"};
    grid-template-columns: 1fr;
  }

  @media (min-width: 800px) {
    grid-template-rows: ${(props) =>
      props.enableLargeImageRow ? "470px auto auto" : "auto"};
    grid-template-columns: minmax(350px, 3fr) 5fr;
  }
`

/**
 *  Open graph images are recommended to be 1200x630, so we use Imgix to crop.
 */
function formatImgOpenGraph(x: string): string {
  if (!x) {
    return x
  }
  const u = new URL(x)
  u.searchParams.set("w", "1200")
  u.searchParams.set("h", "910")
  u.searchParams.set("fit", "crop")
  return u.toString()
}

export function Recipe(props: IRecipeProps) {
  const recipeId = parseInt(props.match.params.id, 10)

  const maybeRecipe = useRecipeFetch({ recipeId })
  const history = useHistory()
  const parsed = new URLSearchParams(props.location.search)
  const editingEnabled = parsed.get("edit") === "1"

  // TODO: maybe move to userRecipeFetch
  // default to metadata being in edit mode when the page is naved to with edit=1
  useRecipeUrlUpdate(
    maybeRecipe.isSuccess
      ? { id: maybeRecipe.data.id, name: maybeRecipe.data.name }
      : null,
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

  if (maybeRecipe.isLoading) {
    return <Loader />
  }

  if (maybeRecipe.isError) {
    return <p>recipe not found</p>
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

  return (
    <div>
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
