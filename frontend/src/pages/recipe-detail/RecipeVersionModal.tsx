import {
  cleanupSemantic,
  Diff,
  DIFF_DELETE,
  DIFF_EQUAL,
  DIFF_INSERT,
  makeDiff,
} from "@sanity/diff-match-patch"
import { isSameYear, parseISO } from "date-fns"
import { clamp, sortBy } from "lodash-es"
import { useState } from "react"

import { assertNever } from "@/assert"
import { clx } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { Image } from "@/components/Image"
import { Modal } from "@/components/Modal"
import { formatAbsoluteDateTime, formatHumanDate } from "@/date"
import { RecipeFetchResponse } from "@/queries/recipeFetch"
import { urlToDomain } from "@/text"
import { useGlobalEvent } from "@/useGlobalEvent"

function Del({ children }: { children: React.ReactNode }) {
  return <del className="bg-[#f26f6fad]">{children}</del>
}

function Ins({ children }: { children: React.ReactNode }) {
  return <ins className="bg-[#5ede7aa9] no-underline">{children}</ins>
}

type FieldDiff<T> = {
  fromValue: T
  toValue: T
}

function ArchivedAtDiff({
  diff,
  type,
}: {
  diff: FieldDiff<string | null>
  type: "before" | "after"
}) {
  const archivedAt = type === "after" ? diff.toValue : diff.fromValue
  if (archivedAt == null) {
    return null
  }

  let action: "unchanged" | "added" | "removed" | "changed"
  if (diff.fromValue === diff.toValue) {
    action = "unchanged"
  } else if (diff.fromValue == null && diff.toValue != null) {
    action = "added"
  } else if (diff.fromValue != null && diff.toValue == null) {
    action = "removed"
  } else {
    action = "changed"
  }

  let diffs: Diff[]
  if (action === "changed") {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let formattedBefore = formatHumanDate(new Date(diff.fromValue!))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let formattedAfter = formatHumanDate(new Date(diff.toValue!))
    if (formattedBefore === formattedAfter) {
      diffs = createDiff(diff.fromValue, diff.toValue)
    } else {
      diffs = createDiff(formattedBefore, formattedAfter)
    }
  } else {
    diffs = [[DIFF_EQUAL, formatHumanDate(new Date(archivedAt))]]
  }

  return (
    <div className="mb-2 flex items-center justify-center">
      <div
        className={clx(
          "px-1 font-medium",
          action === "added" && type === "after" && "bg-[#5ede7aa9]",
          action === "removed" &&
            type === "before" &&
            "bg-[#f26f6fad] line-through",
        )}
      >
        Archived {<DiffToText diffs={diffs} type={type} />}
      </div>
    </div>
  )
}

function DiffToText({
  diffs,
  type: kind,
}: {
  diffs: Diff[]
  type: "before" | "after"
}) {
  let out = []
  for (const [type, value] of diffs) {
    if (type === DIFF_DELETE) {
      if (kind === "after") {
        continue
      }
      out.push(<Del key={type + value}>{value}</Del>)
    } else if (type === DIFF_EQUAL) {
      out.push(<span key={type + value}>{value}</span>)
    } else if (type === DIFF_INSERT) {
      if (kind === "before") {
        continue
      }
      out.push(<Ins key={type + value}>{value}</Ins>)
    } else {
      assertNever(type)
    }
  }
  return <span>{out}</span>
}

function createDiff(
  from: string | null | undefined,
  to: string | null | undefined,
): Diff[] {
  return cleanupSemantic(makeDiff(from ?? "", to ?? ""))
}

function NameDiff({
  diff,
  type,
}: {
  diff: FieldDiff<string | null>
  type: "before" | "after"
}) {
  const diffs = createDiff(diff.fromValue, diff.toValue)
  return (
    <div className="font-serif text-[2.5rem] leading-10">
      <DiffToText diffs={diffs} type={type} />
    </div>
  )
}

function AuthorDiff({
  diff,
  type,
}: {
  diff: FieldDiff<string | null>
  type: "before" | "after"
}) {
  return (
    <div>
      <DiffToText
        diffs={createDiff(diff.fromValue, diff.toValue)}
        type={type}
      />
    </div>
  )
}

function SourceDiff({
  diff,
  type,
}: {
  diff: FieldDiff<string | null>
  type: "before" | "after"
}) {
  let diffs: Diff[]
  if (diff.fromValue === diff.toValue) {
    diffs = [[DIFF_EQUAL, urlToDomain(diff.toValue ?? "")]]
  } else {
    diffs = createDiff(diff.fromValue, diff.toValue)
  }

  return (
    <Field label="From">
      <DiffToText diffs={diffs} type={type} />
    </Field>
  )
}

function TimeDiff({
  diff,

  type,
}: {
  diff: FieldDiff<string | null>

  type: "before" | "after"
}) {
  if (
    (diff.fromValue == null || diff.fromValue.length === 0) &&
    type === "before"
  ) {
    return null
  }
  if ((diff.toValue == null || diff.toValue.length === 0) && type === "after") {
    return null
  }
  const diffs = createDiff(diff.fromValue, diff.toValue)
  return (
    <Field label="Time">
      <DiffToText diffs={diffs} type={type} />
    </Field>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex [word-break:break-word]">
      <div className="w-[90px] min-w-[90px] font-semibold">{label}</div>{" "}
      {children}
    </div>
  )
}

function ServingsDiff({
  diff,
  type,
}: {
  diff: FieldDiff<string | null>
  type: "before" | "after"
}) {
  if (
    (diff.fromValue == null || diff.fromValue.length === 0) &&
    type === "before"
  ) {
    return null
  }
  if ((diff.toValue == null || diff.toValue.length === 0) && type === "after") {
    return null
  }
  const diffs = createDiff(diff.fromValue, diff.toValue)
  return (
    <Field label="Servings">
      <DiffToText diffs={diffs} type={type} />
    </Field>
  )
}

function TagsDiff({
  diff,
  type,
}: {
  diff: FieldDiff<string[] | null>
  type: "before" | "after"
}) {
  if (
    type === "before" &&
    (diff.fromValue == null || diff.fromValue.length === 0)
  ) {
    return null
  }
  if (
    type === "after" &&
    (diff.fromValue == null || diff.fromValue.length === 0)
  ) {
    return null
  }
  const diffs = createDiff(diff.fromValue?.join(", "), diff.toValue?.join(", "))
  return (
    <Field label="Tags">
      <DiffToText diffs={diffs} type={type} />
    </Field>
  )
}

function StepsDiff({
  diff,
  type,
}: {
  diff: FieldDiff<Versions[number]["steps"]>
  type: "before" | "after"
}) {
  const stepsAfter = diff.toValue
  const stepsBefore = diff.fromValue
  const stepsBeforeMapping = new Map<string, string>()
  for (const s of stepsBefore) {
    stepsBeforeMapping.set(s.id + s.position, s.text)
  }
  const stepsAfterMapping = new Map<string, string>()
  for (const s of stepsAfter) {
    stepsAfterMapping.set(s.id + s.position, s.text)
  }
  const stepsToWorkWith = type === "before" ? stepsBefore : stepsAfter

  return (
    <>
      <div className="pt-1 font-semibold">Preparation</div>
      <div className="flex flex-col gap-1">
        {stepsToWorkWith.map((step, index) => {
          const before = stepsBeforeMapping.get(step.id + step.position)
          const after = stepsAfterMapping.get(step.id + step.position)
          const diffs = createDiff(before, after)
          return (
            <div key={index}>
              <div className="text-sm font-semibold">Step {index + 1}</div>
              <div className={clx("max-w-[max-content]")}>
                <DiffToText diffs={diffs} type={type} />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

type Ingredient = Versions[number]["ingredients"][number]

function IngredientsDiff({
  diff,
  type,
}: {
  diff: FieldDiff<Ingredient[]>
  type: "before" | "after"
}) {
  const ingredientsAfter = diff.toValue
  const ingredientsBefore = diff.fromValue

  const ingredientsBeforeMapping = new Map<string, Ingredient>()
  for (const s of ingredientsBefore) {
    ingredientsBeforeMapping.set(s.id + s.type + s.position, s)
  }
  const ingredientsAfterMapping = new Map<string, Ingredient>()
  for (const s of ingredientsAfter) {
    ingredientsAfterMapping.set(s.id + s.type + s.position, s)
  }

  function toText(
    i:
      | {
          type: "ingredient"
          description: string
          quantity: string
          name: string
          optional: boolean
        }
      | undefined,
  ): string {
    if (i == null) {
      return ""
    }
    return (
      i.quantity +
      " " +
      i.name +
      (i.description.length ? ", " + i.description : "") +
      (i.optional ? "[optional]" : "")
    )
  }
  const ingredientsToWorkWith =
    type === "before" ? ingredientsBefore : ingredientsAfter

  return (
    <>
      <div className="pt-1 font-semibold">Ingredients</div>
      <div>
        {sortBy(ingredientsToWorkWith, (x) => x.position).map((i, index) => {
          const before = ingredientsBeforeMapping.get(
            i.id + i.type + i.position,
          )
          const after = ingredientsAfterMapping.get(i.id + i.type + i.position)
          const beforeText =
            before?.type === "section" ? before.title : toText(before)
          const afterText =
            after?.type === "section" ? after.title : toText(after)

          const diffs = createDiff(beforeText, afterText)
          const ingredient = type === "before" ? before : after
          return (
            <div
              key={index}
              className={clx("max-w-[max-content]")}
              data-meta-id={i.id + i.type + i.position}
              data-pos-id={i.position}
            >
              {ingredient?.type === "section" ? (
                <div className="pt-1 text-sm font-semibold">
                  <DiffToText diffs={diffs} type={type} />
                </div>
              ) : (
                <DiffToText diffs={diffs} type={type} />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

function ImageDiff({
  diff,
  type,
}: {
  diff: FieldDiff<Versions[number]["primary_image"] | null>
  type: "before" | "after"
}) {
  if (type === "before" && diff.fromValue == null) {
    return null
  }
  if (type === "after" && diff.toValue == null) {
    return null
  }
  const image = type === "before" ? diff.fromValue : diff.toValue
  return (
    <div
      className={clx(
        "m-1 h-[100px] w-[100px] min-w-[max-content] shrink-0 rounded-sm bg-[--color-background-empty-image]",
        type === "after" &&
          diff.toValue?.id !== diff.fromValue?.id &&
          "outline outline-2 outline-offset-2 outline-[#5ede7aa9]",
        type === "before" &&
          diff.toValue?.id !== diff.fromValue?.id &&
          "outline outline-2 outline-offset-2 outline-[#f26f6fad]",
      )}
    >
      <Image
        size="large"
        sources={
          image && {
            url: image.url,
            backgroundUrl: image.backgroundUrl,
          }
        }
      />
    </div>
  )
}

type DiffMapping = {
  archived_at: FieldDiff<string | null>
  name: FieldDiff<string | null>
  author: FieldDiff<string | null>
  source: FieldDiff<string | null>
  time: FieldDiff<string | null>
  servings: FieldDiff<string | null>
  tags: FieldDiff<string[] | null>
  primary_image: FieldDiff<Versions[number]["primary_image"] | null>
  ingredients: FieldDiff<Versions[number]["ingredients"]>
  steps: FieldDiff<Versions[number]["steps"]>
}

function RecipeView({
  recipeVersion,
  diffs: diffMap,
  type,
}: {
  recipeVersion: Ver | undefined
  diffs: DiffMapping
  type: "before" | "after"
}) {
  if (recipeVersion == null) {
    return <div className="flex-1" />
  }
  return (
    <div className="flex-1">
      <ArchivedAtDiff diff={diffMap.archived_at} type={type} />
      <NameDiff diff={diffMap.name} type={type} />
      <AuthorDiff diff={diffMap.author} type={type} />
      <div className="flex items-center justify-between gap-2">
        <div>
          <SourceDiff diff={diffMap.source} type={type} />
          <TimeDiff diff={diffMap.time} type={type} />
          <ServingsDiff diff={diffMap.servings} type={type} />
          <TagsDiff diff={diffMap.tags} type={type} />
        </div>
        <ImageDiff diff={diffMap.primary_image} type={type} />
      </div>

      <IngredientsDiff diff={diffMap.ingredients} type={type} />

      <StepsDiff diff={diffMap.steps} type={type} />
    </div>
  )
}

type Ver = Versions[number]

function getVersions(
  currentVersion: number,
  chngs: Versions,
): [Ver | undefined, Ver, DiffMapping] {
  const prev = chngs.at(currentVersion + 1)
  const cur = chngs[currentVersion]

  const diffMapping: DiffMapping = {
    archived_at: {
      fromValue: prev?.archived_at ?? null,
      toValue: cur.archived_at,
    },
    name: {
      fromValue: prev?.name ?? null,
      toValue: cur.name,
    },
    author: {
      fromValue: prev?.author ?? null,
      toValue: cur.author,
    },
    source: {
      fromValue: prev?.source ?? null,
      toValue: cur.source,
    },
    time: {
      fromValue: prev?.time ?? null,
      toValue: cur.time,
    },
    servings: {
      fromValue: prev?.servings ?? null,
      toValue: cur.servings,
    },
    tags: {
      fromValue: prev?.tags ?? null,
      toValue: cur.tags,
    },
    primary_image: {
      fromValue: prev?.primary_image ?? null,
      toValue: cur.primary_image,
    },
    ingredients: {
      fromValue: prev?.ingredients ?? [],
      toValue: cur.ingredients ?? [],
    },
    steps: {
      fromValue: prev?.steps ?? [],
      toValue: cur.steps ?? [],
    },
  }
  return [prev, cur, diffMapping]
}

type Versions = RecipeFetchResponse["versions"]

function SideBySideDiff({
  versions,
  currentVersion,
}: {
  versions: Versions
  currentVersion: number
}) {
  const [prev, cur, diffMapping] = getVersions(currentVersion, versions)
  return (
    <div className="flex h-full grow flex-row gap-4 overflow-y-auto">
      {/* in a side by side diff, we show the deleted changes on the left side (previous version), and the added changes on the right side (current version) */}
      <RecipeView recipeVersion={prev} diffs={diffMapping} type={"before"} />
      <RecipeView recipeVersion={cur} diffs={diffMapping} type={"after"} />
    </div>
  )
}

function VersionCreatedTimestamp({ createdAt }: { createdAt: string }) {
  const date = parseISO(createdAt)
  const now = new Date()
  const datestr = formatAbsoluteDateTime(date, {
    includeYear: !isSameYear(date, now),
  })
  return <div>{datestr}</div>
}

function VersionList({
  versions,
  currentVersion,
  setCurrentVersion,
}: {
  versions: Versions
  currentVersion: number
  setCurrentVersion: (_: number) => void
}) {
  return (
    <div className="h-full min-w-[350px] max-w-[350px] grow ">
      {versions.map((change, idx) => (
        <div
          key={change.id}
          className={clx(
            "cursor-pointer rounded-sm px-2 py-1",
            idx === currentVersion && "bg-gray-700",
          )}
          onPointerDown={() => {
            setCurrentVersion(idx)
          }}
        >
          <div className="flex items-center gap-2">
            <VersionCreatedTimestamp createdAt={change.created_at} />
          </div>
          <div className="flex items-center gap-2">
            <Avatar avatarURL={change.actor?.avatar_url ?? null} size={20} />
            <div className="font-medium">{change.actor?.name ?? "User"}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
function RecipeVersionDiff({ versions }: { versions: Versions }) {
  const [currentVersion, setCurrentVersion] = useState<number>(0)
  useGlobalEvent({
    keyDown: (e) => {
      switch (e.key) {
        case "ArrowUp":
          // prevent arrow key from moving cursor to start of input
          e.preventDefault()
          setCurrentVersion((s) => clamp(s - 1, 0, versions.length - 1))
          break
        case "ArrowDown":
          // prevent arrow key from moving cursor to end of input
          e.preventDefault()
          setCurrentVersion((s) => clamp(s + 1, 0, versions.length - 1))
          break
      }
    },
  })
  if (versions.length === 0) {
    return <div className="mt-10 text-center">No versions found</div>
  }
  return (
    <div className="flex h-full w-full gap-2">
      <VersionList
        currentVersion={currentVersion}
        versions={versions}
        setCurrentVersion={setCurrentVersion}
      />
      <SideBySideDiff currentVersion={currentVersion} versions={versions} />
    </div>
  )
}

export function RecipeVersionModal({
  versions,
  isOpen,
  onOpenChange,
}: {
  versions: Versions
  isOpen: boolean
  onOpenChange: (_: boolean) => void
}) {
  return (
    <Modal
      title={<div className="pl-2">Version History</div>}
      isOpen={isOpen}
      full
      onOpenChange={onOpenChange}
    >
      <RecipeVersionDiff versions={versions} />
    </Modal>
  )
}
