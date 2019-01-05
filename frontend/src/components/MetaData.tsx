import React from "react"

import Owner from "@/components/Owner"
import { IRecipe } from "@/store/reducers/recipes"

interface IMetaDataProps {
  readonly author: string
  readonly source: string
  readonly servings: string
  readonly time: string
  readonly owner: IRecipe["owner"]
  readonly recipeId: IRecipe["id"]
  readonly onClick: () => void
}

const isValid = (x?: string) => x !== "" && x != null

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

function MetaPiece({ children }: { children: React.ReactNode }) {
  return <span className="white-space-nowrap">{children}</span>
}

function MetaBold({ children }: { children: React.ReactNode }) {
  return <b className="cursor-pointer">{children}</b>
}

const MetaData = ({
  author = "",
  source = "",
  servings = "",
  time = "",
  owner,
  recipeId,
  onClick
}: IMetaDataProps) => {
  const _author = isValid(author) ? (
    <MetaPiece>
      By <MetaBold>{author}</MetaBold>{" "}
    </MetaPiece>
  ) : null
  const _source = isValid(source) ? (
    <MetaPiece>
      {/* TODO() */}
      from{" "}
      <MetaBold>
        <SourceLink>{source}</SourceLink>
      </MetaBold>{" "}
    </MetaPiece>
  ) : null
  const _servings = isValid(servings) ? (
    <MetaPiece>
      creating <MetaBold>{servings}</MetaBold>{" "}
    </MetaPiece>
  ) : null
  const _time = isValid(time) ? (
    <MetaPiece>
      in <MetaBold>{time}</MetaBold>{" "}
    </MetaPiece>
  ) : null

  const ownerName = owner.type === "team" ? owner.name : "you"

  return (
    <div className="break-word">
      <span onClick={onClick}>
        {_author}
        {_source}
        {_servings}
        {_time}
      </span>

      <Owner id={owner.id} name={ownerName} recipeId={recipeId} />
    </div>
  )
}

export default MetaData
