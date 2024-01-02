import { Hit } from "instantsearch.js"
import { get } from "lodash-es"
import { Highlight } from "react-instantsearch"

export function CustomHighlight(props: {
  hit: Omit<Hit, "__position">
  attribute: string
}) {
  const hasHighlight = get(props.hit?._highlightResult, props.attribute) != null
  if (!hasHighlight) {
    return <>{get(props.hit, props.attribute) ?? ""}</>
  }
  return (
    <Highlight
      // NOTE: Types say it needs __position but it doesn't
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      hit={props.hit as Hit}
      attribute={props.attribute}
      // replace default <mark/> attribute with span to remove yellow highlight.
      highlightedTagName="span"
      classNames={{ highlighted: "font-bold" }}
    />
  )
}
