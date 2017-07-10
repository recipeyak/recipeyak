// We are expecting the state to be in the following format:
// {
//  ID: RECIPE_OBJECT,
//  1: {
//    name: 'Curried Roast Chicken, Durban Style',
//    url: '/recipes/:id/'
//    version: 1.0,
//    updated: 1979-05-27T07:32:00Z,
//    source: 'https://cooking.nytimes.com/recipes/8930-curried-roast-chicken-durban-style'
//    tags: [],
//    ingredients = [
//      '1 3 1/4-pound whole chicken, skinned',
//      '¼ cup lemon juice',
//      '1 2-inch piece peeled ginger, chopped',
//      '3 cloves garlic, chopped',
//      '3 small fresh green chilies, chopped',
//      '1 teaspoon salt',
//      '2 tablespoons extra virgin olive oil',
//      '1 teaspoon ground cumin',
//      '1 teaspoon ground coriander',
//      '½ teaspoon chili powder, preferably coarsely ground',
//      'Freshly ground black pepper',
//    ],
//    steps = [
//      'Cut two deep diagonal slits, down to the bone, in each chicken \
//      breast and one in each leg and thigh. Place chicken, breast side up, \
//      on a sheet of heavy-duty foil large enough to enclose it. Place in a \
//      roasting pan.',
//      'Place lemon juice, ginger, garlic, chilies, salt, oil, cumin and \
//      coriander in a blender and process to a thick purée. Rub purée over \
//      chicken, inside and out, and into slits. Set chicken aside 30 \
//      minutes.',
//      'Heat oven to 400 degrees. Dust chicken with chili powder and black \
//      pepper, enclose in foil and crimp to seal. Roast 1 hour.',
//      'Open foil and baste chicken. Return, uncovered, to oven for 15 \
//      minutes, basting twice more. Transfer chicken to serving platter. \
//      Pour juices from foil into a small dish and serve alongside \
//      chicken.',
//    ]
//  }
// }

// TODO: this is only for testing
const defaultRecipes = {
  1: {
    id: 1,
    name: 'Curried Roast Chicken, Durban Style',
    url: '/recipes/1/',
    version: 1.0,
    updated: '1979-05-27T07:32:00Z',
    source: 'https://cooking.nytimes.com/recipes/8930-curried-roast-chicken-durban-style',
    author: 'Florence Fabricant',
    tags: ['oven'],
    ingredients: [
      '1 3 1/4-pound whole chicken, skinned',
      '¼ cup lemon juice',
      '1 2-inch piece peeled ginger, chopped',
      '3 cloves garlic, chopped',
      '3 small fresh green chilies, chopped',
      '1 teaspoon salt',
      '2 tablespoons extra virgin olive oil',
      '1 teaspoon ground cumin',
      '1 teaspoon ground coriander',
      '½ teaspoon chili powder, preferably coarsely ground',
      'Freshly ground black pepper',
    ],
    steps: [
      'Cut two deep diagonal slits, down to the bone, in each chicken breast and one in each leg and thigh. Place chicken, breast side up, on a sheet of heavy-duty foil large enough to enclose it. Place in a roasting pan.',
      'Place lemon juice, ginger, garlic, chilies, salt, oil, cumin and coriander in a blender and process to a thick purée. Rub purée over chicken, inside and out, and into slits. Set chicken aside 30 minutes.',
      'Heat oven to 400 degrees. Dust chicken with chili powder and black pepper, enclose in foil and crimp to seal. Roast 1 hour.',
      'Open foil and baste chicken. Return, uncovered, to oven for 15 minutes, basting twice more. Transfer chicken to serving platter. Pour juices from foil into a small dish and serve alongside chicken.',
    ],
  },
  2: {
    id: 2,
    name: 'Soy-Sauce-Pickled Eggs',
    url: '/recipes/2/',
    version: 1.0,
    updated: '1979-05-27T07:32:00Z',
    source: 'https://cooking.nytimes.com/recipes/1017850-soy-sauce-pickled-eggs?action=click&module=Global%20Search%20Recipe%20Card&pgType=search&rank=1',
    author: 'Sam Sifton',
    tags: [],
    ingredients: [
      '1 cup Japanese soy sauce',
      '¼ cup mirin (sweetened Japanese rice wine)',
      '1 strip kombu, roughly finger-length',
      '6 fresh egg yolks',
    ],
    steps: [
      'Combine soy sauce, mirin and kombu in a small bowl.',
      'Gently add egg yolks to the soy-sauce mixture, cover and place in refrigerator to cure for six hours, up to two or three days. The yolks will firm up and darken over time, becoming quite hard in three days.',
      'Serve 1, 2 or 3 yolks per person, over steamed short-grained rice.',
    ],
  },
}

export const recipes = (state = defaultRecipes, action) => {
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
