import '../scss/app.scss'

import React from 'react';
import ReactDom from 'react-dom';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import Player from './Player'

function messageReducer(state, msg) {
  // Handle an array of messages
  if (msg.constructor === Array) {
    return msg.reduce((s, m) => messageReducer(s, m), {});
  }

  const player  = msg.player_id
  const partial = Object.assign({}, {[player]: {}}, state);

  if (player === undefined) {
    return state;
  }

  switch (msg.type) {
  case 'player_status':
    partial[player].info = msg.object;
    break;
  case 'track_status':
    partial[player].status = msg.object.event;
    break;
  case 'track_metadata':
    partial[player].metadata = msg.object;
    break;
  default:
    return partial;
  }

  return partial
}

const reduxDevtools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

const store = createStore(messageReducer, reduxDevtools)

// Subscribe to websocket messages from the status server
const socket = new WebSocket(`ws://${window.location.host}/status`);

socket.onmessage = m => {
  let message = JSON.parse(m.data);

  if (message.constructor !== Array) {
    message = [message];
  }

  message.forEach(m => store.dispatch(m));
};

// Overlay component
const Overlay = (props) => {
  if (props.players === undefined) {
    return <div className="overlay" />;
  }

  // Reorder the players for display on the overlay
  const playerOrder = [3, 2];
  let players = playerOrder.map((id) => {
    return props.players[id] ? props.players[id] : null;
  });

  // Filter missing players
  players = players.filter(n => n)

  return <div className="overlay">
    {players.map((p, i) => <Player key={i} id={i} {...p} />)}
  </div>;
}

const propMapper = (state) => ({ players: state });

// Render connected overlay component
const overlay  = React.createElement(connect(propMapper)(Overlay));
const provider = React.createElement(Provider, {store}, overlay);

ReactDom.render(provider, document.getElementById('container'))
