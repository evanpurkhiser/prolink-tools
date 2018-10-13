import camelize from 'camelize';
import { observable } from 'mobx';

const serverBaseUrl = window.location.hash.replace('#', '');
const expectedEvents = ['now_playing', 'stopped'];

const events = observable([]);
const errors = observable([]);

// Connect to event server
const socket = new WebSocket(`ws://${serverBaseUrl}/events`);

socket.addEventListener('open', _ => {
  const subscriptions = expectedEvents;
  socket.send(JSON.stringify({ subscriptions }));
});

const normalizeEvent = e => {
  return { ...camelize(e), ts: Date.parse(e.ts) };
};

const recieveEvent = m => events.push(normalizeEvent(JSON.parse(m.data)));

// Load recent events before we start accepting events from the socket
fetch(`http://${serverBaseUrl}/events/history`)
  .then(data => data.json())
  .then(eventList => {
    const normalizedEvents = eventList
      .map(normalizeEvent)
      .filter(e => expectedEvents.includes(e.event));

    events.replace(normalizedEvents);
    socket.addEventListener('message', recieveEvent);
  })
  .catch(_ => errors.push('Failed to retrieve event history'));

export { events, errors };
