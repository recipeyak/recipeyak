function parseValue(x: string): {
  newPosition: number
  value: string
  quoted?: boolean
} {
  const terminator = x.startsWith(`"`) ? `"` : x.startsWith(`'`) ? `'` : null
  let value = ""

  if (terminator) {
    for (let i = 1; i < x.length; i++) {
      const chr = x[i]
      if (chr === terminator && x[i - 1] === "\\") {
        value = value.slice(0, value.length - 1)
        value += chr
      } else if (chr === terminator || chr === null) {
        return { value, newPosition: i + 1, quoted: true }
      } else {
        value += chr
      }
    }
  } else {
    for (let i = 0; i < x.length; i++) {
      const chr = x[i]
      if (chr === " " || chr === null) {
        return { value, newPosition: i }
      }
      value += chr
    }
  }
  return { value, newPosition: x.length }
}

type QueryField = typeof fieldNames[number]
export type QueryNode = {
  field: QueryField | null
  value: string
  negative?: boolean
  quoted?: boolean
}

const fieldNames = ["author", "recipeId", "ingredient", "name", "tag"] as const

function renderField(field: { field: QueryField; negative?: boolean }): string {
  return (field.negative ? "-" : "") + field.field + ":"
}

function generateFields() {
  const fields = []
  for (const negative of [true, false]) {
    for (const field of fieldNames) {
      if (negative) {
        fields.push({ field, negative })
      } else {
        fields.push({ field })
      }
    }
  }
  return fields
}

export function parseQuery(query: string): QueryNode[] {
  const parsed = []

  for (let i = 0; i < query.length; ) {
    const remainder = query.slice(i)

    const matchingField = generateFields().find((field) => {
      // if we just have "tag:", we want to list all results. But if we have
      // "tag: ", we treat that as a normal string, not a field.
      return (
        remainder.toLocaleLowerCase().startsWith(renderField(field)) &&
        !remainder.toLocaleLowerCase().startsWith(renderField(field) + " ")
      )
    })

    if (matchingField) {
      i += renderField(matchingField).length
      const { newPosition, value, quoted } = parseValue(query.slice(i))
      i += newPosition
      parsed.push({
        field: matchingField.field,
        value,
        quoted,
        negative: matchingField.negative,
      })
    } else if (query[i] === " ") {
      i += 1
    } else {
      const { newPosition, value, quoted } = parseValue(query.slice(i))
      i += newPosition
      parsed.push({ field: null, value, quoted })
    }
  }
  return parsed.filter((x) => x.value)
}
