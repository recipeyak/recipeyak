import Tippy from "@tippyjs/react"
import groupBy from "lodash/groupBy"
import orderBy from "lodash-es/orderBy"
import { useState } from "react"
import { Smile } from "react-feather"

import { clx } from "@/classnames"
import { findReaction } from "@/pages/recipe-detail/reactionUtils"
import { PickVariant } from "@/queries/useQueryUtilTypes"
import { RecipeFetchResponse as Recipe } from "@/queries/useRecipeFetch"
import { useUserId } from "@/useUserId"

type Reaction = PickVariant<
  Recipe["timelineItems"][number],
  "note"
>["reactions"][number]

const REACTION_EMOJIS = ["❤️", "😆", "🤮"] as const

export type ReactionType = (typeof REACTION_EMOJIS)[number]

function reactionTypeToName(x: ReactionType): string {
  return {
    "❤️": "heart",
    "😆": "laughter",
    "🤮": "vomit",
  }[x]
}

function reactionTitle(reactions: Reaction[]): string {
  if (reactions.length === 0) {
    return ""
  }
  if (reactions.length === 1) {
    const reaction = reactions[0]
    return `${reaction.user.name} reacted with ${reactionTypeToName(
      reaction.type,
    )}`
  }

  const names = reactions.map((x) => x.user.name)

  return (
    names.slice(0, names.length - 1).join(", ") +
    " and " +
    names[names.length - 1] +
    ` reacted with ${reactionTypeToName(reactions[0].type)}`
  )
}

export function ReactionPopover(props: {
  onPick: (_: ReactionType) => void
  reactions: readonly Reaction[]
  className?: string
}) {
  const [visible, setVisible] = useState(false)
  const userId = useUserId()
  return (
    <Tippy
      visible={visible}
      onClickOutside={() => {
        setVisible(false)
      }}
      animation={false}
      interactive
      content={
        <div className="flex rounded-[3px] border border-solid  border-[--color-border] bg-[--color-background-card] px-2 py-1 shadow">
          {REACTION_EMOJIS.map((emoji, index) => {
            return (
              <div
                key={emoji}
                onClick={() => {
                  props.onPick(emoji)
                  setVisible(false)
                }}
                className={clx(
                  "h-[32px] w-[32px] cursor-pointer rounded-[3px] border-[--color-border] p-[4px] text-center text-[16px]",
                  findReaction(props.reactions, emoji, userId ?? 0) != null
                    ? "bg-[hsla(0,0%,0%,0.04)]"
                    : "bg-[--color-background-card]",
                  index > 0 && "ml-1",
                )}
              >
                {emoji}
              </div>
            )
          })}
        </div>
      }
    >
      <div
        className={clx(
          "inline-block cursor-pointer rounded-[12px] bg-[--color-background-card] leading-[0] text-[--color-text]",
          props.className,
        )}
        aria-label="open reactions"
        onClick={() => {
          setVisible((s) => !s)
        }}
      >
        <Smile className="text-[--color-text]" size={14} />
      </div>
    </Tippy>
  )
}

export function ReactionsFooter(props: {
  reactions: readonly Reaction[]
  onClick: (_: ReactionType) => void
  onPick: (_: ReactionType) => void
  userId: number | null
  readonly?: boolean
}) {
  const reactionsGroup = groupBy(props.reactions, (x) => x.type)
  const groupedReactions: { emoji: ReactionType; reactions: Reaction[] }[] =
    orderBy(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      (Object.entries(reactionsGroup) as [ReactionType, Reaction[]][]).map(
        ([emoji, reactions]) => ({ emoji, reactions }),
      ),
      (x) => orderBy(x.reactions, (reaction) => reaction.created)[0],
    )
  return (
    <div className="flex items-center text-sm text-[--color-text-muted] print:!hidden">
      {groupedReactions.map(({ emoji, reactions }) => (
        <div
          key={emoji}
          title={reactionTitle(reactions)}
          onClick={() => {
            if (props.readonly) {
              return
            }
            props.onClick(emoji)
          }}
          className={clx(
            "mr-2 inline-flex rounded-[15px]  bg-[--color-background-card] px-[0.3rem] py-0 pr-2 text-center text-[--color-text-muted]",
            reactions.find((reaction) => reaction.user.id === props.userId) !=
              null
              ? "border border-solid border-[--color-border] "
              : "m-[1px]",
            !props.readonly && "cursor-pointer",
          )}
        >
          <div className="flex h-[24px] w-[24px] items-center justify-center">
            {emoji}
          </div>
          <div className="ml-[0.2rem] flex h-[24px] items-center">
            {reactions.length}
          </div>
        </div>
      ))}
      {!props.readonly && groupedReactions.length > 0 && (
        <ReactionPopover onPick={props.onPick} reactions={props.reactions} />
      )}
    </div>
  )
}
