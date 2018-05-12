import React from 'react'
import NoMatch from './NoMatch'
import Loader from './Loader'
import { Helmet } from 'react-helmet'
import MetaData from './MetaData'

/* eslint-disable camelcase */
const RecipeViewing = ({
  id,
  name,
  author,
  source,
  servings,
  time,
  ingredients = [],
  steps = [],
  loading = true,
  error404 = false,
  edit,
  owner = {
    type: 'user',
    id: 0,
    name: '',
  },
}) => {
  if (error404) {
    return <NoMatch/>
  }
  if (loading) {
    return <section className="d-flex justify-content-center">
      <Loader/>
    </section>
  }
  return (
    <div className="d-grid grid-gap-2">
      <Helmet title={ name }/>

      <div className="grid-entire-row d-flex align-center justify-space-between flex-wrap">
        <h1 className="title fs-3rem mb-0">{ name }</h1>
      </div>

      <div className="grid-entire-row">
        <MetaData
          owner={owner}
          name={name}
          author={author}
          source={source}
          servings={servings}
          recipeId={id}
          time={time}/>
      </div>

      <section className="ingredients-preparation-grid">
        <div>
          <h2 className="title is-3 mb-1 font-family-title bold">Ingredients</h2>
          <ul>
            {
              ingredients.map(({ id, quantity, name, description }) =>
                <p key={ id } className="listitem-text justify-space-between">
                  { quantity } { name } { description }
                </p>
              )
            }
          </ul>
        </div>

        <div>
          <h2 className="title is-3 mb-1 font-family-title bold">Preparation</h2>
          <ul>
            {
              steps.map(({ id, text }, i) =>
              <div key={id}>
                <label className="better-label">Step { i + 1}</label>
                <p className="listitem-text mb-2">{ text }</p>
              </div>

              )
            }
          </ul>
        </div>
      </section>

      <section className="d-flex justify-content-end grid-entire-row">
        <button
          onClick={ edit }
          className="my-button is-link">
          Edit
        </button>
      </section>
    </div>
  )
}
/* eslint-enable camelcase */

export default RecipeViewing
