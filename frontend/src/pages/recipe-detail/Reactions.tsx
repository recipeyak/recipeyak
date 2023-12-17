import Tippy from "@tippyjs/react"
import groupBy from "lodash/groupBy"
import orderBy from "lodash-es/orderBy"
import slice from "lodash-es/slice"
import React, { useState } from "react"
import { Smile } from "react-feather"

import { clx } from "@/classnames"
import { findReaction } from "@/pages/recipe-detail/reactionUtils"
import { Reaction } from "@/queries/recipeFetch"
import { useUserId } from "@/useUserId"

const OpenReactions = React.forwardRef(
  (
    props: {
      className?: string
      onClick: () => void
      children?: React.ReactNode
    },

    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <div
        ref={ref}
        className={clx(
          "inline-block rounded-[12px] bg-[var(--color-background-card)] leading-[0] text-[var(--color-text)]",
          props.className,
        )}
        aria-label="open reactions"
        onClick={props.onClick}
      >
        {props.children ? (
          props.children
        ) : (
          <Smile className="text-[var(--color-text)]" size={14} />
        )}
      </div>
    )
  },
)

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
  const initialNames = slice(
    reactions.map((x) => x.user.name),
    reactions.length - 1,
  )
  const lastReaction = reactions[reactions.length - 1]
  return (
    initialNames.join(", ") +
    ", and " +
    lastReaction.user.name +
    ` reacted with ${reactionTypeToName(lastReaction.type)}`
  )
}

export function ReactionPopover(props: {
  onPick: (_: ReactionType) => void
  reactions: Reaction[]
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
        <div className="flex rounded-[3px] border border-solid  border-[var(--color-border)] bg-[var(--color-background-card)] px-2 py-1 shadow">
          {REACTION_EMOJIS.map((emoji, index) => {
            return (
              <div
                key={emoji}
                onClick={() => {
                  props.onPick(emoji)
                  setVisible(false)
                }}
                className={clx(
                  "border-[hsl(0deg, 0%, 86%)] h-[32px] w-[32px] cursor-pointer rounded-[3px] p-[4px] text-center text-[16px]",
                  findReaction(props.reactions, emoji, userId ?? 0) != null
                    ? "bg-[hsla(0, 0%, 0%, 0.04)]"
                    : "bg-[var(--color-background-card)]",
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
      <OpenReactions
        className={clx("cursor-pointer", props.className)}
        onClick={() => {
          setVisible((s) => !s)
        }}
      />
    </Tippy>
  )
}

export function ReactionsFooter(props: {
  reactions: Reaction[]
  onClick: (_: ReactionType) => void
  onPick: (_: ReactionType) => void
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
    <div className="flex items-center text-sm text-[var(--color-text-muted)] print:!hidden">
      {groupedReactions.map(({ emoji, reactions }) => (
        <div
          key={emoji}
          title={reactionTitle(reactions)}
          onClick={() => {
            props.onClick(emoji)
          }}
          className="mr-2 inline-flex cursor-pointer rounded-[15px] border border-solid border-[#d2dff0] bg-[var(--color-background-card)] px-[0.3rem] py-0 pr-2 text-center text-[var(--color-text-muted)]"
        >
          <div className="flex h-[24px] w-[24px] items-center justify-center">
            {emoji}
          </div>
          <div className="ml-[0.2rem] flex h-[24px] items-center">
            {reactions.length}
          </div>
        </div>
      ))}
      {groupedReactions.length > 0 && (
        <ReactionPopover onPick={props.onPick} reactions={props.reactions} />
      )}
    </div>
  )
}
