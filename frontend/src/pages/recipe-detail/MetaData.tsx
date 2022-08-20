import React from "react"
import { Link } from "react-router-dom"

import cls from "@/classnames"
import { IRecipe } from "@/store/reducers/recipes"

type MetaDataProps = {
  readonly author: string
  readonly source: string
  readonly servings: string
  readonly time: string
  readonly title: string | undefined
  readonly tags: IRecipe["tags"]
  readonly onClick: () => void
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

function MetaBold({
  title,
  children,
  onClick,
}: {
  title: string | undefined
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <b
      title={title}
      className={cls({ "cursor-pointer": title != null }, "white-space-nowrap")}
      onClick={onClick}
    >
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
  title,
  tags,
}: MetaDataProps) => {
  const _author = isValid(author) ? (
    <MetaPiece>
      By&nbsp;
      <MetaBold title={title} onClick={onClick}>
        {author}
      </MetaBold>{" "}
    </MetaPiece>
  ) : null
  const _source = isValid(source) ? (
    <MetaPiece>
      from&nbsp;
      {isURL(source) ? (
        <b className="white-space-nowrap">
          <SourceLink>{source}</SourceLink>
        </b>
      ) : (
        <MetaBold title={title} onClick={onClick}>
          {source}
        </MetaBold>
      )}{" "}
    </MetaPiece>
  ) : null
  const _servings = isValid(servings) ? (
    <MetaPiece>
      creating&nbsp;
      <MetaBold title={title} onClick={onClick}>
        {servings}
      </MetaBold>{" "}
    </MetaPiece>
  ) : null
  const _time = isValid(time) ? (
    <MetaPiece>
      in&nbsp;
      <MetaBold title={title} onClick={onClick}>
        {time}
      </MetaBold>{" "}
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
        {tags?.map((x) => (
          <Link
            key={x}
            to={{
              pathname: "/recipes",
              search: `search=${encodeURIComponent(`tag:${x}`)}`,
            }}
            className="tag"
          >
            {x}
          </Link>
        ))}
      </div>
    </>
  )
}

export default MetaData
