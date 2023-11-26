import Tippy from "@tippyjs/react"
import groupBy from "lodash/groupBy"
import orderBy from "lodash-es/orderBy"
import slice from "lodash-es/slice"
import React, { useState } from "react"
import { Smile } from "react-feather"

import { clx } from "@/classnames"
import { useUserId } from "@/hooks"
import { Reaction } from "@/queries/recipeFetch"
import { styled } from "@/theme"

const NoteActionsContainer = styled.div`
  font-size: 0.85rem;
  display: flex;
  align-items: center;
`

const ReactionContainer = styled.div`
  display: flex;
  background: var(--color-background-card);
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  border: 1px solid var(--color-border);
`

const StyledSmile = styled(Smile)`
  color: var(--color-text);
`

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
        {props.children ? props.children : <StyledSmile size={14} />}
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

const ReactionCount = styled.div`
  margin-left: 0.2rem;
  height: 24px;
  display: flex;
  align-items: center;
`

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

const EmojiContainer = styled.div`
  height: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export function findReaction(
  reactions: Reaction[],
  type: ReactionType,
  userId: number,
) {
  return reactions.find(
    (reaction) => reaction.type === type && reaction.user.id === userId,
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
        <ReactionContainer className="shadow">
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
                className={clx({ "ml-1": index > 0 })}
              >
                {emoji}
              </ReactionButton>
            )
          })}
        </ReactionContainer>
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
    <NoteActionsContainer className="text-[var(--color-text-muted)] print:!hidden">
      {groupedReactions.map(({ emoji, reactions }) => (
        <UpvoteReaction
          key={emoji}
          title={reactionTitle(reactions)}
          onClick={() => {
            props.onClick(emoji)
          }}
          className="cursor-pointer text-[var(--color-text-muted)]"
        >
          <EmojiContainer>{emoji}</EmojiContainer>
          <ReactionCount>{reactions.length}</ReactionCount>
        </UpvoteReaction>
      ))}
      {groupedReactions.length > 0 && (
        <ReactionPopover onPick={props.onPick} reactions={props.reactions} />
      )}
    </NoteActionsContainer>
  )
}
