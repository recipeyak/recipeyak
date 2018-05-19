// https://github.com/react-dnd/react-dnd/tree/4d37ad5072ce8fb6a488a8672d5700676e643817/packages/documentation/examples/04%20Sortable/Simple

// BSD License

// Copyright (c) 2015, Facebook, Inc. All rights reserved.

// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:

//  * Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.

//  * Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.

//  * Neither the name Facebook nor the names of its contributors may be used to
//    endorse or promote products derived from this software without specific
//    prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import React, { Component } from 'react'
import { connect } from 'react-redux'

import Card from './Step'
import { updatingStep } from '../store/actions'

@connect()
export default class StepContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      cards: this.props.steps
    }
  }

  moveCard = (dragIndex, hoverIndex) => {
    const { cards } = this.state
    const dragCard = cards[dragIndex]

    this.setState(prevState => {
      const cards = prevState.cards
      cards.splice(dragIndex, 1)
      cards.splice(hoverIndex, 0, dragCard)
      return {
        cards
      }
    })
  }

  completeMove = (stepID, arrIndex) => {
    const nextCard = this.state.cards[arrIndex + 1]
    const prevCard = this.state.cards[arrIndex - 1]
    let newPos = null

    if (nextCard == null && prevCard == null) {
      // there is only one card in the list, so we don't make any change
      return
    } else if (nextCard == null && prevCard != null) {
      newPos = prevCard.position + 10.0
    } else if (nextCard != null && prevCard == null) {
      newPos = nextCard.position / 2
    } else if (nextCard != null && prevCard != null) {
      newPos = (nextCard.position - prevCard.position) / 2 + prevCard.position
    }
    if (newPos == null) { throw new Error('Invalid position') }

    this.setState(prevState => {
      const cards = [...prevState.cards]
      cards[arrIndex].position = newPos
      return {
        cards
      }
    }, () => this.props.dispatch(updatingStep(this.props.recipeID, stepID, { position: newPos })))
  }

  render () {
    const { cards } = this.state

    return (
      <div>
        {cards.map((card, i) => (
          <Card
            key={card.id}
            index={i}
            id={card.id}
            text={card.text}
            moveCard={this.moveCard}
            position={card.position}
            completeMove={this.completeMove}
          />
        ))}
      </div>
    )
  }
}
