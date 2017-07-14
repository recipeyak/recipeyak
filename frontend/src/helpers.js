export const flatten = arr => arr.reduce(
  (acc, val) => acc.concat(
    Array.isArray(val) ? flatten(val) : val
  ),
  []
)

export const deepCopy = obj => Object.keys(obj).reduce((acc, key) => {
  acc[key] = obj[key]
  return acc
}, {})

export const getIngredients = recipeArray => {
  return recipeArray.reduce((acc, recipe) => {
    return acc.concat(recipe.ingredients)
  }, [])
}

// flatten function used inside reduce functions
const reduceFlatten = (acc, val) =>
  acc.concat(
    Array.isArray(val)
    ? flatten(val)
    : val
  )

const countDupes = (acc, b) => {
  if (acc[b] == null) {
    acc[b] = 1
  } else {
    acc[b]++
  }
  return acc
}

const print = x => {
  console.log(print)
  return x
}
const expandOccurances = rec => {
  const occurs = rec.inCart
  const output = []
  for (let i = 0; i < occurs; i++) {
    output.push(rec.ingredients)
  }
  return output
}

export const combineRecipeIngredients = (recipes) => {
  const recipesObject = recipes
    .map(expandOccurances)
    .reduce(reduceFlatten, [])
    .reduce(countDupes, {})

  return Object.keys(recipesObject)
    .map(key => ({ ingredient: key, occurs: recipesObject[key] }))
    .sort((a, b) => a.ingredient > b.ingredient)
}
