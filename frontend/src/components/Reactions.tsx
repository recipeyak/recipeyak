import Tippy from "@tippyjs/react"
import groupBy from "lodash/groupBy"
import orderBy from "lodash-es/orderBy"
import slice from "lodash-es/slice"
import React, { useState } from "react"
import { Smile } from "react-feather"

import { classNames as cls } from "@/classnames"
import { useCurrentUser } from "@/hooks"
import { styled } from "@/theme"

const NoteActionsContainer = styled.div`
  font-size: 0.85rem;
  display: flex;
  align-items: center;
`

const ReactionContainer = styled.div`
  display: flex;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
`

const StyledSmile = styled(Smile)`
  color: #7a7a7a;
  &:hover {
    color: #575757;
  }
`

const ReactionButtonContainer = styled.div`
  background-color: white;
  color: #172b4d;

  /* border: 1px solid #ebecf0; */
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
  background-color: white;
  display: inline-flex;
  /* color: #172b4d; */

  border-radius: 15px;

  border-width: 1px;
  border-color: #d2dff0;
  margin-right: 0.5rem;
  text-align: center;
  &:hover {
    border-color: hsl(0deg, 0%, 71%);
  }
`

const ReactionButton = styled.div<{ pressed: boolean }>`
  padding: 4px;
  height: 32px;
  width: 32px;
  font-size: 16px;
  text-align: center;
  /* border-style: solid; */
  /* border-width: 1px; */
  border-radius: 3px;
  border-color: hsl(0deg, 0%, 86%);
  cursor: pointer;

  &:hover {
    /* border-color: #4a4a4a; */
    background-color: hsla(0, 0%, 0%, 0.06);
  }
  background-color: ${(props) =>
    props.pressed ? "hsla(0, 0%, 0%, 0.04)" : "initial"};
`

const REACTION_EMOJIS = ["❤️", "😆", "🤮"] as const

export type ReactionType = typeof REACTION_EMOJIS[number]

function reactionTypeToName(x: ReactionType): string {
  return {
    "❤️": "heart",
    "😆": "laughter",
    "🤮": "vomit",
  }[x]
}

export type Reaction = {
  id: string
  type: ReactionType
  user: {
    id: number
    name: string
  }
  created: string
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

export function ReactionPopover(props: {
  onPick: (_: ReactionType) => void
  reactions: Reaction[]
}) {
  const [visible, setVisible] = useState(false)
  const user = useCurrentUser()
  return (
    <Tippy
      visible={visible}
      onClickOutside={() => {
        setVisible(false)
      }}
      animation={false}
      interactive
      content={
        <ReactionContainer className="box-shadow-normal">
          {REACTION_EMOJIS.map((emoji, index) => {
            return (
              <ReactionButton
                key={emoji}
                onClick={() => {
                  props.onPick(emoji)
                  setVisible(false)
                }}
                pressed={
                  props.reactions.find(
                    (reaction) =>
                      reaction.type === emoji &&
                      reaction.user.id === user.id?.toString(),
                  ) != null
                }
                className={cls({ "ml-1": index > 0 })}
              >
                {emoji}
              </ReactionButton>
            )
          })}
        </ReactionContainer>
      }
    >
      <OpenReactions
        className="cursor-pointer ml-auto"
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
    <NoteActionsContainer className="text-muted">
      {groupedReactions.map(({ emoji, reactions }) => (
        <UpvoteReaction
          key={emoji}
          title={reactionTitle(reactions)}
          onClick={() => {
            props.onClick(emoji)
          }}
          className="cursor-pointer text-muted"
        >
          <EmojiContainer>{emoji}</EmojiContainer>
          <ReactionCount>{reactions.length}</ReactionCount>
        </UpvoteReaction>
      ))}
    </NoteActionsContainer>
  )
}
