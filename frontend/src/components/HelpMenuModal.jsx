import React from 'react'

import { classNames } from '../classnames'

export default class HelpMenuModal extends React.Component {
  state = {
    show: false,
  }

  componentWillMount () {
    document.addEventListener('keypress', this.handleKeyPress)
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount () {
    document.removeEventListener('keypress', this.handleKeyPress)
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown = e => {
    if (e.key === 'Escape') {
      this.close()
    }
  }

  handleKeyPress = e => {
    if (document.activeElement.tagName !== 'BODY') return
    if (e.key === '?') {
      this.setState(prev => ({ show: !prev.show }))
    }
  }

  close = () => {
    this.setState({ show: false })
  }
  render () {
    const keybinds = [
      {
        key: '#',
        description: 'delete scheduled recipe',
      },
      {
        key: '?',
        description: 'toggle help menu',
      },
    ]
    return (
      <div>
        <div className={classNames('modal', { 'is-active': this.state.show })}>
          <div className="modal-background" onClick={this.close}></div>
          <div className="modal-content">
            <div className="box">
              <section className="d-flex space-between">
                <h1 className="fs-4 bold">Keybinds</h1>
                <button className="delete" aria-label="close" onClick={this.close}></button>
              </section>
              <section className="d-flex">
                <div className="mr-4">
                  { keybinds.map(({ description }) =>
                    <div className="mb-1" key={description}>
                      { description }
                    </div>)
                  }
                </div>
                <div>
                  { keybinds.map(({ key }) =>
                    <div className="mb-1" key={key}>
                      <kbd>{ key }</kbd>
                    </div>)
                  }
                </div>
              </section>
            </div>
          </div>
          <button className="modal-close is-large" aria-label="close" onClick={this.close}></button>
        </div>
      </div>
    )
  }
}
