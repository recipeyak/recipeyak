export const matchesQuery = ({
  name = '',
  author = '',
  ingredients = []
}, query) => {
  // https://stackoverflow.com/a/37511463/3720597
  const removeAccents = x => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const normalize = (x = '') => removeAccents(x).replace(/\W/g, '').toLowerCase()

  // basic search with ability to prepend a tag to query and only search for
  // things relevent to that tag

  name = normalize(name)
  author = normalize(author)

  // get the actual query value from search_space:query_here
  const normalizeQuery = x => {
    const z = x.split(':')
    return z.length > 0
      ? normalize(z[1])
      : normalize(z)
  }

  if (query.indexOf('author:') === 0) {
    return author.includes(normalizeQuery(query))
  }

  if (query.indexOf('ingredient:') === 0) {
    return ingredients
      .map(x => normalize(x.name))
      .some(x => x.includes(normalizeQuery(query)))
  }

  if (query.indexOf('name:') === 0) {
    return name.includes(normalizeQuery(query))
  }

  query = normalize(query)

  query = ['author', 'name', 'ingredient']
    .map(x => x + ':')
    .some(x => x.includes(query))
    ? ''
    : query

  return name.includes(query) ||
    author.includes(query)
}
