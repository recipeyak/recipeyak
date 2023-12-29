import { Hit } from "instantsearch.js"
import { Highlight } from "react-instantsearch"

export function CustomHighlight(props: { hit: Hit; attribute: string }) {
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
