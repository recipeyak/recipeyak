export const recipe = (props, propName, componentName) => {
  const prop = props[propName]
  const recipe = {
    name: '',
    url: '',
    version: 1.0,
    updated: '',
    source: '',
    tags: [''],
    ingredients: ['']
  }
  Object.keys(recipe).forEach(key => {
    const val = recipe[key]
    if (prop[key] !== val) {
      return new Error(
        `Invalid prop '${propName}' supplied to '${componentName}'. Validation failed.`
      )
    }
  })
}
