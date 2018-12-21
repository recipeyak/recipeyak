import React from "react"

import Owner from "./Owner"
import { teamURL } from "../urls"

const MetaData = ({
  author = "",
  source = "",
  servings = "",
  time = "",
  owner,
  recipeId,
  onClick
}) => {
  const isValid = x => x !== "" && x != null

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

  return (
    <div className="break-word">
      <span onClick={onClick}>
        {_author}
        {_source}
        {_servings}
        {_time}
      </span>
      <Owner
        type={owner.type}
        url={teamURL(owner.id, owner.name)}
        name={owner.name}
        recipeId={recipeId}
      />
    </div>
  )
}

export default MetaData
