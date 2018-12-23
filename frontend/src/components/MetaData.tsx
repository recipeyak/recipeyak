import React from "react"

import Owner from "./Owner"
import { IRecipe } from "../store/reducers/recipes"

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
    <span>
      By <b className="cursor-pointer">{author}</b>{" "}
    </span>
  ) : null
  const _source = isValid(source) ? (
    <span>
      from <b className="cursor-pointer">{source}</b>{" "}
    </span>
  ) : null
  const _servings = isValid(servings) ? (
    <span>
      creating <b className="cursor-pointer">{servings}</b>{" "}
    </span>
  ) : null
  const _time = isValid(time) ? (
    <span>
      in <b className="cursor-pointer">{time}</b>{" "}
    </span>
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
