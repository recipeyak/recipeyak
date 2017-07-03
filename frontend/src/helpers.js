// const combineLike = list => {
//   const items = {}
//   const output = []

//   list.forEach(x => {
//     if (items.hasOwnProperty(x)) {
//       items[x]++
//     } else {
//       items[x] = 1
//     }
//   })

//   Object.entries(items).forEach(x => {
//     output.push(x)
//   })

//   return output
// }

// const text = combineLike(ingre.map(x => x.trim()))
//     .map(x => ({'item': x[0], 'quantity': x[1]}))
//     .map(x => <li key={ x.item }><b>{ x.quantity }x</b> {x.item}</li>)

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
