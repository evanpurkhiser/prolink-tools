import { computed, action } from 'mobx';
import { events, errors } from 'app/receiver';

const blobToBase64 = blob =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

/**
 * TrackEvents encapsulates logic for computing data derrived from events
 * recieved from the prolink server.
 */
class TrackEvents {
  constructor(events) {
    this.events = events;
  }

  /**
   * played is a computed value that will compute the list of played tracks,
   * including currently playing tracks, in the order that they were most
   * recently played.
   *
   * A `playedAt` timestamp will be present on the track object.
   */
  @computed
  get played() {
    const trackEvents = this.events
      .filter(e => e.event === 'now_playing')
      .map(e => ({ ...e, data: { ...e.data, playing: false } }))
      .reverse()
      .filter(
        // Remove consecutively played tracks
        (event, i, items) => i === 0 || event.data.id !== items[i - 1].data.id
      );

    const recordedStops = [];

    // Mark currently playing tracks by finding tracks played after stop events
    // associated to that player.
    this.events
      .filter(e => e.event === 'stopped')
      .reverse()
      .forEach(event => {
        if (recordedStops.includes(event.playerId)) {
          return;
        }
        recordedStops.push(event.playerId);

        // Locate the track that has begun playing _after_ the stop event for
        // this player.
        const playedTrackIndex = trackEvents.findIndex(
          t => t.playerId === event.playerId && t.ts > event.ts
        );
        if (playedTrackIndex !== -1) {
          trackEvents[playedTrackIndex].data.playing = true;
        }
      });

    return trackEvents.map(e => ({ ...e.data, playedAt: e.ts }));
  }

  /**
   * nowPlaying is a computed value that will compute the currently playing
   * track .
   */
  @computed
  get nowPlaying() {
    return this.played.get(0, null);
  }

  /**
   * Used in the addExample to keep a incrementing example ID.
   */
  static exampleId = 0;

  /**
   * Adds an example track to the track events.
   */
  @action
  async addExample() {
    const img = await fetch('https://picsum.photos/200/200/?random');
    const artwork = await blobToBase64(await img.blob());

    const data = {
      id: this.exampleId++,
      artist: 'Example Artist',
      title: 'Example Track Title',
      album: 'Example Album',
      label: 'Example Label',
      genre: 'Example Genre',
      comment: 'Example Comment',
      key: '01A',
      artwork,
    };

    events.push({ event: 'now_playing', ts: Date.now(), data });
  }
}

export default new TrackEvents(events);
