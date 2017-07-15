import React from 'react'
import {mount} from 'enzyme'
import {MemoryRouter} from 'react-router-dom'

import RecipeList from './RecipeList.jsx'
import Recipe from './RecipeItem.jsx'

describe('<RecipeList/>', () => {
  it('renders without crashing', () => {
    mount(<MemoryRouter><RecipeList/></MemoryRouter>)
  })
  it('accepts props', () => {
    const recipes = [{
      id: 123,
      title: 'Recipe title',
      tags: ['tagOne', 'tagTwo'],
      author: 'Recipe author',
      source: '',
      url: '',
      ingredients: ['ingredientOne', 'ingredientTwo'],
    }]
    const element = mount(<MemoryRouter><RecipeList recipes={recipes}/></MemoryRouter>)
    expect(element.find('RecipeList').props().recipes).toEqual(recipes)
  })
  it('handles recipes object without tags', () => {
    const recipes = [{
      id: 123,
      title: 'Recipe title',
      author: 'Recipe author',
      source: '',
      url: '',
      ingredients: [''],
    }]
    mount(<MemoryRouter><RecipeList recipes={recipes}/></MemoryRouter>)
  })
})
