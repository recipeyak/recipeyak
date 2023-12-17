import Tippy from "@tippyjs/react"
import groupBy from "lodash/groupBy"
import orderBy from "lodash-es/orderBy"
import slice from "lodash-es/slice"
import React, { useState } from "react"
import { Smile } from "react-feather"

import { clx } from "@/classnames"
import { findReaction } from "@/pages/recipe-detail/reactionUtils"
import { Reaction } from "@/queries/recipeFetch"
import { styled } from "@/theme"
import { useUserId } from "@/useUserId"

const ReactionButtonContainer = styled.div`
  background-color: var(--color-background-card);
  color: var(--color-text);
  border-radius: 12px;
  line-height: 0;
  display: inline-block;
`

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
      <ReactionButtonContainer
        ref={ref}
        className={props.className}
        onClick={props.onClick}
      >
        {props.children ? (
          props.children
        ) : (
          <Smile className="text-[var(--color-text)]" size={14} />
        )}
      </ReactionButtonContainer>
    )
  },
)

const UpvoteReaction = styled.div`
  padding: 0 0.3rem;
  padding-right: 0.5rem;
  border-style: solid;
  background-color: var(--color-background-card);
  display: inline-flex;
  border-radius: 15px;
  border-width: 1px;
  border-color: #d2dff0;
  margin-right: 0.5rem;
  text-align: center;
`

const ReactionButton = styled.div<{ pressed: boolean }>`
  padding: 4px;
  height: 32px;
  width: 32px;
  font-size: 16px;
  text-align: center;
  border-radius: 3px;
  border-color: hsl(0deg, 0%, 86%);
  cursor: pointer;
  background-color: ${(props) =>
    props.pressed ? "hsla(0, 0%, 0%, 0.04)" : "initial"};
  background-color: var(--color-background-card);
`

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
              <ReactionButton
                key={emoji}
                onClick={() => {
                  props.onPick(emoji)
                  setVisible(false)
                }}
                pressed={
                  findReaction(props.reactions, emoji, userId ?? 0) != null
                }
                className={clx(index > 0 && "ml-1")}
              >
                {emoji}
              </ReactionButton>
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
        <UpvoteReaction
          key={emoji}
          title={reactionTitle(reactions)}
          onClick={() => {
            props.onClick(emoji)
          }}
          className="cursor-pointer text-[var(--color-text-muted)]"
        >
          <div className="flex h-[24px] w-[24px] items-center justify-center">
            {emoji}
          </div>
          <div className="ml-[0.2rem] flex h-[24px] items-center">
            {reactions.length}
          </div>
        </UpvoteReaction>
      ))}
      {groupedReactions.length > 0 && (
        <ReactionPopover onPick={props.onPick} reactions={props.reactions} />
      )}
    </div>
  )
}
