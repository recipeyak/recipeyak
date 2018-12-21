import React from "react"

export default class IngredientView extends React.Component {
  render() {
    const { quantity, name, description, optional } = this.props

    const fmtDescription = description ? ", " + description : ""

    return (
      <p className="listitem-text justify-space-between">
        {quantity} {name}
        {fmtDescription}{" "}
        {optional ? <span className="text-muted">[optional]</span> : ""}
      </p>
    )
  }
}
