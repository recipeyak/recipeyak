import React from 'react'

class Dropdown extends React.Component {
  state = {
    show: false,
  }

  componentWillMount () {
    document.addEventListener('click', this.handleGeneralClick)
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleGeneralClick)
  }

  handleGeneralClick = e => {
    const clickedDropdown = this.dropdown && this.dropdown.contains(e.target)
    if (clickedDropdown) return
    this.setState({ show: false })
  }

  render () {
    return (
      <section ref={dropdown => { this.dropdown = dropdown }}>
        <a onClick={ () => this.setState(prev => ({ show: !prev.show })) }
           className="better-nav-item">{ this.props.name }</a>
        <div className={
          'box p-absolute direction-column align-items-start mt-1 pr-2 pl-2 pt-3 pb-3' +
            (this.state.show ? ' d-flex' : ' d-none')
        }>
          { this.props.children }
        </div>
      </section>
    )
  }
}

export default Dropdown
