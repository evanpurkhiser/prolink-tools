# PROLINK Server

`prolink-server` is a daemon that provides a unified HTTP + websocket API for
communicating with devices on the PROLINK network. This tool uses the
[`prolink-go`](https://github.com/EvanPurkhiser/prolink-go) library and is
constrained to the limitations of the library.

### Documentation

- [Event Streaming](#event-streaming)
- [Mix Status](#mix-status)
- [REST API](#rest-api)
- [Building and running](#wip)

### Startup

When started the server will attempt to auto-configure itself by looking for
active PROLINK devices on the network. If it is unable to locate other devices
on the network it will require manual configuration to begin broadcasting
itself as a device on the prolink network.

### Event Streaming

The most useful feature of the prolink-server is the Websocket event streaming
functionality. This allows you to subscribe to specific events emitted by
devices on the PROLINK network.

Start by opening the websocket. Here's a javascript example:

```js
// Open the websocket from the prolink-server
const socket = new WebSocket('ws://localhost:8000/events');
```

When you first open the websocket, you will not receive any events. You will
need to tell the server what events you would like to subscribe to.

```js
// Subscribe to track load events and to set start and end events. In this
// example we could use this to keep a log of all tracks the DJ loaded.
const subscriptions = {
  subscriptions: ['status:track_id', 'set_started', 'set_ended'],
};

socket.send(JSON.stringify(subscriptions));
```

You can update your list of subscriptions anytime by sending a new set of
subscriptions. Note that subscriptions are not additive. If you send a new set
of subscriptions excluding any previous events you had subscribed to, you will
no longer receive those events.

Events will always be JSON messages with a common structure:

```py
{
  # The event type emmited. This will match the event type keys below.
  "type": "status:track_id",

  # When an event is emmited from a particular device on the network (and not a
  # event inferred from the state of multiple device) the player ID will be
  # set. Otherwise the player ID will be `null`.
  "player_id": 1,

  # The precise event timestamp, formatted as a RFC3339Nano
  "ts": "2018-09-09T05:59:38.13825-00:00",

  # The data object describing the event. This will usually be the place of
  # interest. Each event contains a different data object.
  "data": { }
}
```

The full list of events is as follows:

<table>
  <thead>
    <tr>
      <th align="left">Event Type</th>
      <th align="left">Emitted Event</th>
      <th><code>player_id</code></th>
    </tr>
  </thead>
  <tbody>
    <tr valign="top">
      <td><code>set_started</code></td>
      <td markdown="1">
        Emitted when a new DJ set has started.
      </td>
      <td align="center"><code>null</code></td>
    </tr>
    <tr valign="top">
      <td><code>set_ended</code></td>
      <td markdown="1">
        Emitted when the active DJ set has ended.
      </td>
      <td align="center"><code>null</code></td>
    </tr>
    <tr valign="top">
      <td><code>now_playing</code></td>
      <td>
        <p>
          Emitted when a new track is considered to be playing. This event
          follows the rules configured in the mix status feature of the server.
          See the <a href="#mix-status-now-playing">now playing</a> section for
          more information.
        </p>
        <details>
          <summary>ᴇxᴀᴍᴘʟᴇ ᴇᴠᴇɴᴛ <code>data</code> ᴏʙᴊᴇᴄᴛ</summary>
          <pre lang="json">{
  "id": 125,
  "path": "/Users/evan/Music/my-track.mp3",
  "title": "Shivers",
  "artist": "Armin Van Buuren",
  "album": "Shivers",
  "label": "Armada",
  "genre": "Trance",
  "comment": "ARMA034",
  "key": "5B",
  "length": 453,
  "date_added": "2018-09-09T05:59:37-00:00",
  "artwork": "data:image/png;base64,..."
}</pre>
        </details>
      </td>
      <td align="center"><strong>YES</strong></td>
    </tr>
    <tr valign="top">
      <td><code>coming_soon</code></td>
      <td>
        <p>
          Emitted when a new track has been loaded into a CDJ, however the
          player has not yet been marked as live.  See the <a
          href="#mix-status">coming soon</a> section for more information.
        </p>
        <details>
          <summary>ᴇxᴀᴍᴘʟᴇ ᴇᴠᴇɴᴛ <code>data</code> ᴏʙᴊᴇᴄᴛ</summary>
          <pre lang="json">{
  "id": 125,
  "path": "/Users/evan/Music/my-track.mp3",
  "title": "Shivers",
  "artist": "Armin Van Buuren",
  "album": "Shivers",
  "label": "Armada",
  "genre": "Trance",
  "comment": "ARMA034",
  "key": "5B",
  "length": 453,
  "date_added": "2018-09-09T05:59:37-00:00",
  "artwork": "data:image/png;base64,..."
}</pre>
        </details>
      </td>
      <td align="center"><strong>YES</strong></td>
    </tr>
    <tr valign="top">
      <td><code>stopped</code></td>
      <td>
        Emitted when a player enters a stopped state.
      </td>
      <td align="center"><strong>YES</strong></td>
    </tr>
    <tr valign="top">
      <td><code>device_added</code></td>
      <td>
        <p>
          Emitted when a new device has been <strong>added</strong> to the
          PROLINK network.
        </p>
        <details>
          <summary>ᴇxᴀᴍᴘʟᴇ ᴇᴠᴇɴᴛ <code>data</code> ᴏʙᴊᴇᴄᴛ</summary>
          <pre lang="json">{
  "player_id": 1,
  "name": "CDJ-2000nexus",
  "type": "cdj",
  "mac": "74:5e:1c:57:82:d4",
  "ip": "10.0.0.32",
  "last_active": "2018-09-09T05:59:38.13825-07:00"
}</pre>
        </details>
      </td>
      <td align="center"><code>null</code></td>
    </tr>
    <tr valign="top">
      <td><code>device_removed</code></td>
      <td>
        <p>
          Emitted when a device on the PROLINK network has been
          <strong>removed</strong>.
        </p>
        <details>
          <summary>ᴇxᴀᴍᴘʟᴇ ᴇᴠᴇɴᴛ <code>data</code> ᴏʙᴊᴇᴄᴛ</summary>
          <pre lang="json">{
  "player_id": 1,
  "name": "CDJ-2000nexus",
  "type": "cdj",
  "mac": "74:5e:1c:57:82:d4",
  "ip": "10.0.0.32",
  "last_active": "2018-09-09T05:59:38.13825-07:00"
}</pre>
        </details>
      </td>
      <td align="center"><code>null</code></td>
    </tr>
    <tr valign="top">
      <td colspan="2">
        <strong>Player Status Events</strong>
      </td>
      <td align="center"><strong>YES</strong></td>
    </tr>
    <tr valign="top">
      <td><code>status:track_id</code></td>
      <td colspan="2">
        <p>
          Emitted when the track currently loaded into a player has been
          changed. The track ID returned within the data will be an object
          which may be used with the <a href="#"><code>GET /track</code>
          endpoint</a> to query for the track.
        </p>
        <details>
          <summary>ᴇxᴀᴍᴘʟᴇ ᴇᴠᴇɴᴛ <code>data</code> ᴏʙᴊᴇᴄᴛ</summary>
          <pre lang="json">{
  "id": 123,
  "device": 1,
  "slot": "usb",
  "type": "rekordbox",
}</pre>
        </details>
      </td>
    </tr>
    <tr valign="top">
      <td><code>status:play_state</code></td>
      <td colspan="2">
        <p>
          Emitted when the play state of the player changes. The play state
          returned in <code>data</code> will be one of the following states:
        </p>
        <code>empty</code>,
        <code>loading</code>,
        <code>playing</code>,
        <code>looping</code>,
        <code>paused</code>,
        <code>cued</code>,
        <code>cuing</code>,
        <code>searching</code>,
        <code>spun_down</code>,
        <code>ended</code>
      </td>
    </tr>
    <tr valign="top">
      <td><code>status:bpm</code></td>
      <td colspan="2">
        Emitted when the set BPM of the player changes. For example: <code>175.5</code>.
      </td>
    </tr>
    <tr valign="top">
      <td><code>status:pitch</code></td>
      <td colspan="2">
        Emitted when the current pitch percentage of the player changes. For example:
        <code>3.86</code>.
      </td>
    </tr>
    <tr valign="top">
      <td><code>status:effective_pitch</code></td>
      <td colspan="2">
        Emitted when the <em>instantaneous effective</em> pitch percentage of
        the player changes.  That is, if the jogwheel is moved, while the
        jogwheel is moving the effective pitch may be higher or lower depending
        on which way it is spun. For example: <code>-3.86</code>.
      </td>
    </tr>
    <tr valign="top">
      <td><code>status:on_air</code></td>
      <td colspan="2">
        Emitted when the on-air status of a player changes. That is, when a DJM
        is linked on the network with CDJs and the joghweel is illuminated red,
        it is considered "on-air". A boolean value.
      </td>
    </tr>
    <tr valign="top">
      <td><code>status:sync_enabled</code></td>
      <td colspan="2">
        Emitted when sync is turned on or off on a player. A boolean value.
      </td>
    </tr>
    <tr valign="top">
      <td><code>status:is_master</code></td>
      <td colspan="2">
        Emitted when a player becomes or loses master. A boolean value.
        Describe Me
      </td>
    </tr>
    <tr valign="top">
      <td><code>status:beat</code></td>
      <td colspan="2">
        <p>
          Emitted after each beat occurs in the currently playing track. The
          <code>data</code> object includes various beat metrics of the
          actively playing track.
        </p>
        <details>
          <summary>ᴇxᴀᴍᴘʟᴇ ᴇᴠᴇɴᴛ <code>data</code> ᴏʙᴊᴇᴄᴛ</summary>
          <pre lang="json">{
  "absolute_beat": 123,
  "beat_in_measure": 1,
  "beats_until_cue": null,
}</pre>
        </details>
      </td>
    </tr>
  </tbody>
</table>

---

NOTE: The rest of this document is not complete.

---

### Event History

### Mix Status

The following HTTP APIs are avilable:

#### `GET /devices`

Retrieves the list of all active devices on the PROLINK network.

```json
[
  {
    "player_id": 1,
    "name": "CDJ-2000nexus",
    "type": "cdj",
    "mac": "74:5e:1c:57:82:d4",
    "ip": "10.0.0.32",
    "last_active": "2018-09-09T05:59:38.13825-07:00"
  },
  {
    "player_id": 4,
    "name": "CDJ-2000nexus",
    "type": "cdj",
    "mac": "74:5e:1c:57:82:d8",
    "ip": "10.0.0.33",
    "last_active": "2018-09-09T05:59:36.91051-07:00"
  },
  {
    "player_id": 33,
    "name": "DJM-900nexus",
    "type": "djm",
    "mac": "74:5e:1c:56:bd:9f",
    "ip": "10.0.0.31",
    "last_active": "2018-09-09T05:59:37.216936-07:00"
  }
]
```

---

#### `GET /config`

Retrives the current server configuration. Note that if the configuration could
not be auto-detected the interface and player_id may be null.

```json
{
  "interface": "enp0"
  "player_id": 2,
  "available_interfaces": ["enp0", "bridge0"]
  "mix_status": {
    "allowed_interrupt_beats": 8,
    "beats_until_reported": 128,
    "time_between_sets": 360
  }
}
```

##### `mix_status` configuration

The prolink server provides events derrived from the the player statuses to
determine when a track is being mixed in, selected as an upcoming trck, and
when a "set" has started and ended. This functionaliy is configurable:

- `allowed_interrupt_beats`
  The number of beats that a track may be off-air before it is considered to
  be "stopped" and the next upcoming on-air track will be promoted to playing.
  This is useful to allow for "cutting" of your tracks. Generally you will
  want this to be a beat or two more than how long you usually cut for to
  allow for slop.

  For example, if you sometimes cut a 4 bar fill, you could configure this for
  5 bars to ensure the track doesn't get marked as stopped if you don't cut
  back in before the 4th bar.

  The downside of configuring this longer is that when you cut a track with the
  intentions of not bringing it back in (for a transition), the next track will
  not be reported as started (unless the cut track is cued or pauses)

- `beats_until_reported`

---

#### `PUT /config`

- `POST /config/autodetect`

Making this request will ask the prolink server to re-detech

- `GET /status`

- `GET /events`

Making a request to this endpoing will upgrade it to a websocket, where
events will be streamed. When the socket is first opened no events will be
recieved and you will have to send a message with a list of events you wish
to recieve.

`device_added`
`device_removed`
`now_playing`
`stopped`
`coming_soon`
`set_started`
`set_ended`

```

```
