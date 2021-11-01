import React from "react"
import { Link } from "react-router-dom"

import Owner from "@/components/Owner"
import { IRecipe } from "@/store/reducers/recipes"

interface IMetaDataProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly author: string
  readonly source: string
  readonly servings: string
  readonly time: string
  readonly owner: IRecipe["owner"]
  readonly recipeId: IRecipe["id"]
  readonly tags: IRecipe["tags"]
}

const isValid = (x?: string) => x !== "" && x != null

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

function MetaPiece({ children }: React.HTMLAttributes<HTMLDivElement>) {
  return <>{children}</>
}

function MetaBold({ children, onClick }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <b title="click  to edit" className="cursor-pointer" onClick={onClick}>
      {children}
    </b>
  )
}

const MetaData = ({
  author = "",
  source = "",
  servings = "",
  time = "",
  owner,
  onClick,
  recipeId,
  tags,
}: IMetaDataProps) => {
  const _author = isValid(author) ? (
    <MetaPiece>
      By <MetaBold onClick={onClick}>{author}</MetaBold>{" "}
    </MetaPiece>
  ) : null
  const _source = isValid(source) ? (
    <MetaPiece>
      from{" "}
      {isURL(source) ? (
        <MetaBold>
          <SourceLink>{source}</SourceLink>
        </MetaBold>
      ) : (
        <MetaBold onClick={onClick}>{source}</MetaBold>
      )}{" "}
    </MetaPiece>
  ) : null
  const _servings = isValid(servings) ? (
    <MetaPiece>
      creating <MetaBold onClick={onClick}>{servings}</MetaBold>{" "}
    </MetaPiece>
  ) : null
  const _time = isValid(time) ? (
    <MetaPiece>
      in <MetaBold onClick={onClick}>{time}</MetaBold>{" "}
    </MetaPiece>
  ) : null

  const ownerName = owner.type === "team" ? owner.name : "you"

  return (
    <>
      <div className="break-word">
        <span>
          {_author}
          {_source}
          {_servings}
          {_time}
        </span>

        <Owner id={owner.id} name={ownerName} recipeId={recipeId} />
      </div>
      <div>
        {tags?.map(x => (
          <Link
            to={{
              pathname: "/recipes",
              search: `search=${encodeURIComponent(`tag:${x}`)}`,
            }}
            className="tag">
            {x}
          </Link>
        ))}
      </div>
    </>
  )
}

export default MetaData
