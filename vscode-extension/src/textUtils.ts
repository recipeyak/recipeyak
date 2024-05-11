export function snakeToCamel(str: string) {
  return str.replace(/_[a-z]/g, (match) => match[1].toUpperCase());
}

export function camelToSnake(str: string) {
  return str.replace(/[A-Z]/g, (match) => "_" + match.toLowerCase());
}
