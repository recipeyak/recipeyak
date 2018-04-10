import React from 'react'

import Owner from './Owner'
import { teamURL } from '../urls'

const MetaData = ({
  author = '',
  source = '',
  servings = '',
  time = '',
  owner,
  recipeId,
}) => {
  const isValid = x => x !== '' && x != null

  const _author = isValid(author)
    ? <span>By <b>{author}</b> </span>
    : null
  const _source = isValid(source)
    ? <span>from <b>{source}</b> </span>
    : null
  const _servings = isValid(servings)
    ? <span>creating <b>{servings}</b> </span>
    : null
  const _time = isValid(time)
    ? <span>in <b>{time}</b> </span>
    : null

  return <div className="break-word">
    <span>{ _author }{ _source }{ _servings }{ _time }</span>
    <Owner type={owner.type} url={teamURL(owner.id)} name={owner.name} recipeId={recipeId}/>
  </div>
}

export default MetaData
