import React, { Component } from 'react';
import './App.css';
import { cards } from './event-data';

class App extends Component {
  state = {
    viewingCard: null,
    editingCards: null,
    city: [],
    road: [],
  };

  save() {
    localStorage.setItem('city', JSON.stringify(this.state.city));
    localStorage.setItem('road', JSON.stringify(this.state.road));
  }

  load() {
    const city = localStorage.getItem('city');
    const road = localStorage.getItem('road');

    if (!city || !road) return this.initDeck();

    this.setState({
      city: JSON.parse(city),
      road: JSON.parse(road),
    });
  }

  initDeck() {
    console.log('setting up a new deck...');
    let city = [...Array(30)].map((e, index) => index);
    let road = [...Array(30)].map((e, index) => index);
    city = this.shuffle(city);
    road = this.shuffle(road);
    this.setState({ city, road });
  }

  componentDidMount() {
    this.load();
  }

  shuffle(originalCards) {
    let array = originalCards.slice(0);
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  drawCard(type) {
    this.setState({ viewingCard: type });
  }

  // modifies only the current drawn card
  removeCard() {
    const type = this.state.viewingCard;
    let newCards = this.state[type].slice();
    newCards.splice(0, 1);
    this.setState(
      {
        [type]: newCards,
        viewingCard: null,
      },
      this.save
    );
  }

  // modifies only the current drawn card
  moveToBottomOfDeck() {
    const type = this.state.viewingCard;
    let newCards = this.state[type].slice();
    newCards.splice(0, 1);
    newCards.push(this.state[type][0]);
    this.setState(
      {
        [type]: newCards,
        viewingCard: null,
      },
      this.save
    );
  }

  toggleCard(id, type, isInDeck) {
    let newCards = this.state[type].slice();

    if (isInDeck) {
      let index = newCards.indexOf(id);
      newCards.splice(index, 1);
    } else {
      newCards.push(id);
    }

    this.setState(
      {
        [type]: this.shuffle(newCards),
      },
      this.save
    );
  }

  renderEditingCards() {
    const cardList = cards[this.state.editingCards].map(card => {
      const type = this.state.editingCards;
      const checked = this.state[type].indexOf(card.id) !== -1;
      return (
        <label className="event-listitem" key={card.id}>
          <input
            type="checkbox"
            checked={checked}
            onChange={() => this.toggleCard(card.id, type, checked)}
          />
          Event #{card.id + 1}
        </label>
      );
    });

    return (
      <div className="App">
        {cardList}
        <div
          className="button button-floating"
          onClick={() => this.setState({ editingCards: null })}
        >
          Done Editing
        </div>
      </div>
    );
  }

  render() {
    if (this.state.editingCards) {
      return this.renderEditingCards();
    }

    if (this.state.viewingCard) {
      const type = this.state.viewingCard;
      const id = this.state[type][0];
      return (
        <div className="App App-viewer">
          <div className="card" tabIndex={1}>
            <img className="card-front" alt="" src={cards[type][id].front} />
            <img className="card-back" alt="" src={cards[type][id].back} />
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
      );
    }
    return (
      <div className="App">
        <h2 className="title">Gloomhaven Events</h2>
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
      </div>
    );
  }
}

export default App;
