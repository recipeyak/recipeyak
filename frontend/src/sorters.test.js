import {
  byNameAlphabetical,
  ingredientByNameAlphabetical
} from './sorters'

describe('byNameAlphabetical', () => {
  it('sorter keeps already sorted list sorted', () => {
    const ingredients = [{
      "unit": "12",
      "name": "barley rusks"
    }, {
      "unit": "0.5 cup",
      "name": "celery"
    }, {
      "unit": "2",
      "name": "cinnamon sticks"
    }, {
      "unit": "1 teaspoon",
      "name": "cumin seeds"
    }, {
      "unit": "2 ounce",
      "name": "feta"
    }, {
      "unit": "2 tablespoon",
      "name": "fresh mint"
    }, {
      "unit": "1 teaspoon",
      "name": "garam masala"
    }, {
      "unit": "1",
      "name": "garlic clove"
    }, {
      "unit": "12",
      "name": "garlic cloves"
    }, {
      "unit": "1",
      "name": "ginger piece"
    }, {
      "unit": "2",
      "name": "green jalapeno peppers"
    }, {
      "unit": "1.5 teaspoon",
      "name": "ground cumin"
    }, {
      "unit": "0.5 teaspoon",
      "name": "ground turmeric"
    }, {
      "unit": "1 teaspoon",
      "name": "kosher salt"
    }, {
      "unit": "2",
      "name": "lemons"
    }, {
      "unit": "1 tablespoon",
      "name": "neutral oil"
    }, {
      "unit": "0.5625 cup",
      "name": "olive oil"
    }, {
      "unit": "0.75 cup",
      "name": "pureed tomatoes"
    }, {
      "unit": "1.5 cup",
      "name": "red beans"
    }, {
      "unit": "2 tablespoon",
      "name": "sherry vinegar"
    }, {
      "unit": "2 pound",
      "name": "skinless, bonless chicken thighs"
    }, {
      "unit": "3 tablespoon",
      "name": "slivered almonds"
    }, {
      "unit": "2 tablespoon",
      "name": "tomato paste"
    }, {
      "unit": "2 pound",
      "name": "tomatoes"
    }, {
      "unit": "2 tablespoon",
      "name": "unsalted butter"
    }, {
      "unit": "2",
      "name": "white onions"
    }, {
      "unit": "3 tablespoon",
      "name": "whole-milk yogurt"
    }]


    expect(
      ingredients
    ).toEqual(ingredients.sort(byNameAlphabetical))
  })

  it('sorts a list correctly', () => {
    const ingredients = [{
      "unit": "2",
      "name": "lemons"
    }, {
      "unit": "0.5625 cup",
      "name": "olive oil"
    }, {
      "unit": "12",
      "name": "garlic cloves"
    }, {
      "unit": "1 teaspoon",
      "name": "kosher salt"
    }, {
      "unit": "2 pound",
      "name": "tomatoes"
    }, {
      "unit": "1.5 cup",
      "name": "red beans"
    }, {
      "unit": "0.5 cup",
      "name": "celery"
    }, {
      "unit": "1",
      "name": "garlic clove"
    }, {
      "unit": "2 ounce",
      "name": "feta"
    }, {
      "unit": "2 tablespoon",
      "name": "fresh mint"
    }, {
      "unit": "2 tablespoon",
      "name": "sherry vinegar"
    }, {
      "unit": "12",
      "name": "barley rusks"
    }, {
      "unit": "2 tablespoon",
      "name": "unsalted butter"
    }, {
      "unit": "1 tablespoon",
      "name": "neutral oil"
    }, {
      "unit": "1 teaspoon",
      "name": "cumin seeds"
    }, {
      "unit": "2",
      "name": "cinnamon sticks"
    }, {
      "unit": "2",
      "name": "white onions"
    }, {
      "unit": "1",
      "name": "ginger piece"
    }, {
      "unit": "2",
      "name": "green jalapeno peppers"
    }, {
      "unit": "0.75 cup",
      "name": "pureed tomatoes"
    }, {
      "unit": "2 tablespoon",
      "name": "tomato paste"
    }, {
      "unit": "1.5 teaspoon",
      "name": "ground cumin"
    }, {
      "unit": "0.5 teaspoon",
      "name": "ground turmeric"
    }, {
      "unit": "3 tablespoon",
      "name": "whole-milk yogurt"
    }, {
      "unit": "2 pound",
      "name": "skinless, bonless chicken thighs"
    }, {
      "unit": "3 tablespoon",
      "name": "slivered almonds"
    }, {
      "unit": "1 teaspoon",
      "name": "garam masala"
    }]

    const expected = [{
      "unit": "12",
      "name": "barley rusks"
    }, {
      "unit": "0.5 cup",
      "name": "celery"
    }, {
      "unit": "2",
      "name": "cinnamon sticks"
    }, {
      "unit": "1 teaspoon",
      "name": "cumin seeds"
    }, {
      "unit": "2 ounce",
      "name": "feta"
    }, {
      "unit": "2 tablespoon",
      "name": "fresh mint"
    }, {
      "unit": "1 teaspoon",
      "name": "garam masala"
    }, {
      "unit": "1",
      "name": "garlic clove"
    }, {
      "unit": "12",
      "name": "garlic cloves"
    }, {
      "unit": "1",
      "name": "ginger piece"
    }, {
      "unit": "2",
      "name": "green jalapeno peppers"
    }, {
      "unit": "1.5 teaspoon",
      "name": "ground cumin"
    }, {
      "unit": "0.5 teaspoon",
      "name": "ground turmeric"
    }, {
      "unit": "1 teaspoon",
      "name": "kosher salt"
    }, {
      "unit": "2",
      "name": "lemons"
    }, {
      "unit": "1 tablespoon",
      "name": "neutral oil"
    }, {
      "unit": "0.5625 cup",
      "name": "olive oil"
    }, {
      "unit": "0.75 cup",
      "name": "pureed tomatoes"
    }, {
      "unit": "1.5 cup",
      "name": "red beans"
    }, {
      "unit": "2 tablespoon",
      "name": "sherry vinegar"
    }, {
      "unit": "2 pound",
      "name": "skinless, bonless chicken thighs"
    }, {
      "unit": "3 tablespoon",
      "name": "slivered almonds"
    }, {
      "unit": "2 tablespoon",
      "name": "tomato paste"
    }, {
      "unit": "2 pound",
      "name": "tomatoes"
    }, {
      "unit": "2 tablespoon",
      "name": "unsalted butter"
    }, {
      "unit": "2",
      "name": "white onions"
    }, {
      "unit": "3 tablespoon",
      "name": "whole-milk yogurt"
    }]

    expect(
      ingredients.sort(byNameAlphabetical)
    ).toEqual(expected)

  })

  it('should ignore words medium, large, small', () => {
    const before = [
      {
        "unit": "1",
        "name": "large tomato"
      },
      {
        "unit": "1",
        "name": "medium tomato"
      },
      {
        "unit": "1",
        "name": "mushroom"
      }
    ]

    const expected = [
      {
        "unit": "1",
        "name": "mushroom"
      },
      {
        "unit": "1",
        "name": "large tomato"
      },
      {
        "unit": "1",
        "name": "medium tomato"
      }
    ]

    expect(
      before.sort(ingredientByNameAlphabetical)
    ).toEqual(expected)
  })

  it('should ignore ground', () => {
    const before = [
      {
        "unit": "1 teaspoon",
        "name": "garam masala"
      },
      {
        "unit": "1 teaspoon",
        "name": "ground cumin"
      }
    ]

    const expected = [
      {
        "unit": "1 teaspoon",
        "name": "ground cumin"
      },
      {
        "unit": "1 teaspoon",
        "name": "garam masala"
      }
    ]

    expect(
      before.sort(ingredientByNameAlphabetical)
    ).toEqual(expected)
  })

})
