import React from 'react'

export default class Scroll extends React.Component {
  static defaultProps = {
    height: 'inherit',
    width: 'inherit',
    padding: 'inherit',
  }
  render () {
    const { height, width, children, padding } = this.props

    const style = {
      maxHeight: height,
      maxWidth: width,
      overflow: 'auto',
      padding,
    }

    return (
      <div style={style}>
        { children }
      </div>
    )
  }
}
