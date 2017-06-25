import {observable} from 'mobx'
import recipes from './mockup-data.js'

const appState = observable({
  cart: [],
  recipes: recipes,
})

export default appState
