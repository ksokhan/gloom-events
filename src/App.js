import React, { Component } from 'react'
import './App.css'
import { cards } from './event-data'

class App extends Component {
  state = {
    viewingCard: null,
    editingCards: null,
    deckIndex: 0,
    decks: [],
    city: [],
    road: []
  }

  save() {
    const { deckIndex, city, road } = this.state
    localStorage.setItem(`city${deckIndex || ''}`, JSON.stringify(city))
    localStorage.setItem(`road${deckIndex || ''}`, JSON.stringify(road))
  }

  load() {
    const { deckIndex } = this.state
    // empty string for zero index for backward compatibility
    // for when there was only single deck support in app
    const city = localStorage.getItem(`city${deckIndex || ''}`)
    const road = localStorage.getItem(`road${deckIndex || ''}`)

    if (!city || !road) return this.initDeck()

    this.setState({
      city: JSON.parse(city),
      road: JSON.parse(road)
    })
  }

  initDeck() {
    console.log('setting up a new deck...')
    let city = [...Array(30)].map((e, index) => index)
    let road = [...Array(30)].map((e, index) => index)
    city = this.shuffle(city)
    road = this.shuffle(road)
    this.setState({ city, road })
  }

  addDeck = () => {
    const deckName = window.prompt(
      'Enter a deck name (name of the campaign using this deck)'
    )
    if (deckName !== null) {
      this.setState(({ decks, deckIndex }) => {
        const newDecks = decks.slice()
        newDecks.push(deckName)
        localStorage.setItem('decks', JSON.stringify(newDecks))
        return {
          decks: newDecks,
          deckIndex: newDecks.length - 1
        }
      }, this.load)
    }
  }

  componentDidMount() {
    const decks = JSON.parse(localStorage.getItem('decks')) || [
      'First event deck'
    ]
    this.setState({ decks })
    this.load()
  }

  shuffle(originalCards) {
    let array = originalCards.slice(0)
    var currentIndex = array.length,
      temporaryValue,
      randomIndex
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1
      // And swap it with the current element.
      temporaryValue = array[currentIndex]
      array[currentIndex] = array[randomIndex]
      array[randomIndex] = temporaryValue
    }
    return array
  }

  drawCard(type) {
    this.setState({ viewingCard: type })
  }

  // modifies only the current drawn card
  removeCard() {
    const type = this.state.viewingCard
    let newCards = this.state[type].slice()
    newCards.splice(0, 1)
    this.setState(
      {
        [type]: newCards,
        viewingCard: null
      },
      this.save
    )
  }

  // modifies only the current drawn card
  moveToBottomOfDeck() {
    const type = this.state.viewingCard
    let newCards = this.state[type].slice()
    newCards.splice(0, 1)
    newCards.push(this.state[type][0])
    this.setState(
      {
        [type]: newCards,
        viewingCard: null
      },
      this.save
    )
  }

  toggleCard(id, type, isInDeck) {
    let newCards = this.state[type].slice()

    if (isInDeck) {
      let index = newCards.indexOf(id)
      newCards.splice(index, 1)
    } else {
      newCards.push(id)
    }

    this.setState(
      {
        [type]: this.shuffle(newCards)
      },
      this.save
    )
  }

  renderEditingCards() {
    const type = this.state.editingCards
    const cardList = cards[type].map((card, index) => {
      const checked = this.state[type].indexOf(card.id) !== -1
      return (
        <label className="event-listitem" key={card.id}>
          <input
            type="checkbox"
            checked={checked}
            onChange={() => this.toggleCard(card.id, type, checked)}
          />
          Event #{card.id + 1}
        </label>
      )
    })

    return (
      <div className="App App-edit-cards">
        <div className="App-edit-cards-list">{cardList}</div>
        <div
          className="button button-floating"
          onClick={() => this.setState({ editingCards: null })}
        >
          Done Editing
        </div>
      </div>
    )
  }

  renderDeckSwitcher() {
    if (this.state.decks.length === 1) return false
    return (
      <div className="dropdown-wrapper">
        <select
          className="dropdown"
          value={this.state.deckIndex}
          onChange={event => {
            this.setState({ deckIndex: Number(event.target.value) }, this.load)
          }}
        >
          {this.state.decks.map((item, i) => (
            <option value={i} key={i}>
              {item}
            </option>
          ))}
        </select>
      </div>
    )
  }

  render() {
    if (this.state.editingCards) {
      return this.renderEditingCards()
    }

    if (this.state.viewingCard) {
      const type = this.state.viewingCard
      const id = this.state[type][0]
      return (
        <div className="App App-viewer">
          <div className="card" tabIndex={1}>
            <img className="card-front" alt="" src={cards[type][id].front} />
            <img
              tabIndex={2}
              className="card-back"
              alt=""
              src={cards[type][id].back}
            />
          </div>
          <div className="button" onClick={() => this.moveToBottomOfDeck()}>
            <img className="button-icon" alt="" src={'bottom.svg'} />
            &nbsp; Put on bottom of deck
          </div>
          <div className="button" onClick={() => this.removeCard()}>
            <img className="button-icon" alt="" src={'rip.svg'} />
            &nbsp; Rip up card
          </div>
        </div>
      )
    }
    return (
      <div className="App">
        <div className="App-home">
          <div>
            <div className="card-button" onClick={() => this.drawCard('city')}>
              City Event
            </div>
            <div
              className="button button-secondary"
              onClick={() => this.setState({ editingCards: 'city' })}
            >
              Edit events ({this.state.city.length})
            </div>
          </div>
          <div>
            <div
              className="card-button card-button-road"
              onClick={() => this.drawCard('road')}
            >
              Road Event
            </div>
            <div
              className="button button-secondary"
              onClick={() => this.setState({ editingCards: 'road' })}
            >
              Edit events ({this.state.road.length})
            </div>
          </div>
        </div>
        {this.renderDeckSwitcher()}
        <div className="button button-outline" onClick={this.addDeck}>
          Create another event deck
        </div>
      </div>
    )
  }
}

export default App
