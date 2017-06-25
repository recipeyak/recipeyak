import {observable, action} from 'mobx'
import recipes from './mockup-data.js'

const store = observable({
  recipes: recipes,
  get cart () { return this.recipes.filter(recipe => recipe.inCart > 0) },
})

store.addToCart = action(id => {
  const index = store.recipes.findIndex(recipe => recipe.id === id)
  store.recipes[index].inCart++
  const recipe = recipes[index]
  console.log(`Added recipe '${recipe.title}' to cart`)
})

store.removeFromCart = action(id => {
  const index = store.recipes.findIndex(recipe => recipe.id === id)
  store.recipes[index].inCart--
  const recipe = recipes[index]
  console.log(`Removed recipe '${recipe.title}' from cart`)
})

export default store
