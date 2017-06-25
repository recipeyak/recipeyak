import {observable, action} from 'mobx'
import recipes from './mockup-data.js'

const store = observable({
  cart: [],
  recipes: recipes,
})

store.addToCart = action(id => {
  store.cart.push(store.recipes.find(recipe => recipe.id === id))
})

export default store
