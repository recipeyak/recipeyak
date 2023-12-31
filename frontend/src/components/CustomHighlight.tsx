import { Hit } from "instantsearch.js"
import { get } from "lodash-es"
import { Highlight } from "react-instantsearch"

export function CustomHighlight(props: { hit: Hit; attribute: string }) {
  const hasHighlight = get(props.hit?._highlightResult, props.attribute) != null
  if (!hasHighlight) {
    return <>{get(props.hit, props.attribute) ?? ""}</>
  }
  return (
    <Highlight
      hit={props.hit}
      attribute={props.attribute}
      // replace default <mark/> attribute with span to remove yellow highlight.
      highlightedTagName="span"
      classNames={{ highlighted: "font-bold" }}
    />
  )
}
