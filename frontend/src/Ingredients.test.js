import React from 'react'
import {mount, shallow} from 'enzyme'

import Ingredients from './Ingredients.jsx'

describe('<Ingredients/>', () => {
  it('renders without crashing', () => {
    const ingredients = ['onion', 'tomato', 'potato']
    mount(<Ingredients ingredients={ingredients}/>)
  })
  it('has the correct props', () => {
    const ingredients = ['onion', 'tomato', 'potato']
    const element = mount(<Ingredients ingredients={ingredients}/>)
    expect(element.props().ingredients).toEqual(ingredients)
  })
  it('displays the correct list', () => {
    const ingredients = ['onion', 'tomato']
    const expected = [<li key="onion">onion</li>, <li key="tomato">tomato</li>]
    const element = shallow(<Ingredients ingredients={ingredients}/>)
    expect(element.containsAllMatchingElements(expected)).toEqual(true)
  })
})
