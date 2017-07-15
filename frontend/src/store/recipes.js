// We are expecting the state to be in the following format:
// {
//  ID: RECIPE_OBJECT,
//  1: {
//    name: 'Curried Roast Chicken, Durban Style',
//    url: '/recipes/:id/'
//    version: 1.0,
//    updated: 1979-05-27T07:32:00Z,
//    source: 'url',
//    tags: ['foo', 'bar'],
//    ingredients = ['30g foo', '15ml bar'],
//    steps = ['Add foo and bar to pot']
//  }
// }

export const recipes = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_RECIPE':
      return Object.assign({}, state, { [action.recipe.id]: action.recipe })
    case 'REMOVE_RECIPE':
      return Object.assign({}, state, { [action.id]: undefined })
    default:
      return state
  }
}

export default recipes
