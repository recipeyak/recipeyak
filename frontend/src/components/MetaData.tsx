import React from "react"
import { Link } from "react-router-dom"

import { IRecipe } from "@/store/reducers/recipes"

interface IMetaDataProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly author: string
  readonly source: string
  readonly servings: string
  readonly time: string
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
  return <span>{children}</span>
}

function MetaBold({ children, onClick }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <b
      title="click  to edit"
      className="cursor-pointer white-space-nowrap"
      onClick={onClick}>
      {children}
    </b>
  )
}

const MetaData = ({
  author = "",
  source = "",
  servings = "",
  time = "",
  onClick,
  tags,
}: IMetaDataProps) => {
  const _author = isValid(author) ? (
    <MetaPiece>
      By&nbsp;<MetaBold onClick={onClick}>{author}</MetaBold>{" "}
    </MetaPiece>
  ) : null
  const _source = isValid(source) ? (
    <MetaPiece>
      from&nbsp;
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
      creating&nbsp;<MetaBold onClick={onClick}>{servings}</MetaBold>{" "}
    </MetaPiece>
  ) : null
  const _time = isValid(time) ? (
    <MetaPiece>
      in&nbsp;<MetaBold onClick={onClick}>{time}</MetaBold>{" "}
    </MetaPiece>
  ) : null

  return (
    <>
      <div className="break-word">
        <div>
          {_author}
          {_source}
          {_servings}
          {_time}
        </div>
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
