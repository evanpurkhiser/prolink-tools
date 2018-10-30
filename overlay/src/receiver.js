import camelize from 'camelize';
import { observable, autorun } from 'mobx';

import config from 'app/config';

const EXPECTED_EVENTS = ['now_playing', 'stopped'];

const connected = observable.box(false);
const events = observable([]);
const errors = observable([]);

const normalizeEvent = e => ({ ...camelize(e), ts: Date.parse(e.ts) });

function onConnect() {
  socket.send(JSON.stringify({ subscriptions: EXPECTED_EVENTS }));
  connected.set(true);
}

function onClose() {
  connected.set(false);
}

function onMessage(message) {
  events.push(normalizeEvent(JSON.parse(message.data)));
}

let socket = null;

autorun(async _ => {
  if (socket !== null) {
    socket.close();
  }

  // Connect to event server
  try {
    socket = new WebSocket(`ws://${config.serverAddress}/events`);
  } catch (DOMException) {}

  socket.addEventListener('open', onConnect);
  socket.addEventListener('close', onClose);

  // Load recent events before we start accepting events from the socket
  const resp = await fetch(`http://${config.serverAddress}/events/history`);
  const history = await resp.json();

  const normalizedEvents = history
    .map(normalizeEvent)
    .filter(e => expectedEvents.includes(e.event));

  events.replace(normalizedEvents);
  socket.addEventListener('message', onMessage);
});

export { connected, events, errors };
