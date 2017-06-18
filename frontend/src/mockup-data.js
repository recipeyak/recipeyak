// NOTE: For development purposes
const recipes = [
  {
    id: 12345,
    url: '/recipes/123',
    title: 'Curried Roast Chicken, Durban Style',
    tags: ['Entree', 'Chicken', 'Oven', 'Long Prep Time'],
    author: 'Florence Fabricant',
    source: 'https://cooking.nytimes.com/recipes/8930-curried-roast-chicken-durban-style',
    inCart: false,
  },
  {
    id: 1234,
    url: '/recipes/123',
    title: 'Charlie Bird\'s Farro Salad',
    tags: ['Side', 'Stovetop', 'Long Prep Time'],
    author: 'Melissa Clark',
    source: 'https://cooking.nytimes.com/recipes/1015843-charlie-birds-farro-salad',
    inCart: true,
  },
  {
    id: 234,
    url: '/recipes/123',
    title: 'Kale Tabbouleh',
    tags: ['Side', 'Stovetop'],
    author: 'Melissa Clark',
    source: 'https://cooking.nytimes.com/recipes/12915-kale-tabbouleh',
    inCart: true,
  },
  {
    id: 1232344,
    url: '/recipes/123',
    title: 'Takeout-Style Sesame Noodles',
    tags: ['Entree', 'Stovetop', 'Quick'],
    author: 'Sam Sifton',
    source: 'https://cooking.nytimes.com/recipes/9558-takeout-style-sesame-noodles',
    inCart: true,
  },
  {
    id: 123,
    url: '/recipes/123',
    title: 'Green Goddess Roasted Chicken',
    tags: ['Entree', 'Oven', 'Overnight'],
    author: 'Melissa Clark',
    source: 'https://cooking.nytimes.com/recipes/1015232-green-goddess-roasted-chicken',
    inCart: false,
  },
]

const ingredients = ['1 3 1/4-pound whole chicken, skinned',
  '¼ cup lemon juice',
  '1 2-inch piece peeled ginger, chopped',
  '3 cloves garlic, chopped',
  '3 small fresh green chilies, chopped',
  '1 teaspoon salt',
  '2 tablespoons extra virgin olive oil',
  '1 teaspoon ground cumin',
  '1 teaspoon ground coriander',
  '½ teaspoon chili powder, preferably coarsely ground',
  ' Freshly ground black pepper']

export default recipes

export { ingredients }
