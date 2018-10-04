# prolink-server

`prolink-server` is a daemon that provides a unified HTTP + websocket API for
communicating with devices on the PROLINK network. This tool uses the
[`prolink-go`](https://github.com/EvanPurkhiser/prolink-go) library and is
constrained to the limitations of the library.

The goal of this service is to provide a basic building block for creating
tools such as OBS overlays, m3u playlists for recorded sets, live tracklist
tweeters, and more.

### Documentation

- [Event Streaming](#event-streaming)
- [Event History](#event-history)
- [Mix Status](#mix-status)
- [HTTP API](#http-api)
- [Configuration](#configuration)
- [Building and running](#building-and-running)

### Startup

When started the server will attempt to auto-configure itself by looking for
active PROLINK devices on the network. If it is unable to locate other devices
on the network it will require manual configuration to begin broadcasting
itself as a device on the PROLINK network.

**NOTE:** The server cannot be run on the same machine as rekordbox, as a
single device on the network cannot act as two devices on the PROLINK network.

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
  subscriptions: ['status:track_key', 'set_started', 'set_ended'],
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
  "type": "status:track_key",

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
          See the <a href="#mix-status">now playing</a> section for
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
      <td><code>status:track_key</code></td>
      <td colspan="2">
        <p>
          Emitted when the track currently loaded into a player has been
          changed. The track Key returned within the data will be an object
          which may be used with the <a href="#get-track"><code>GET
          /track</code> endpoint</a> to query for the track.
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

### Event History

All events are stored for a period of configured time (defaults to four hours).
This data can later be retrieved using the `GET /events` API endpoint. This
can be useful if you've just connected to the websocket and would like to query
for events that happened prior to connecting.

<details>
  <summary>
    <code>GET /events</code>
    <p>
      Retrieve a list of historical event messages. Can be filtered and limited.
    </p>
  </summary>

  <pre lang="txt">TODO. This feature is not yet available</pre>
</details>

### Mix Status

The prolink server provides events derived from the player statuses to
determine when a track is being mixed in, selected as an upcoming track, and
when a "set" has started and ended. The following events will be omitted as
situations arise.

See the [mix status configuration](#mix_status-configuration) section for configuration of this functionality.

`now_playing`

Potentially the most important event (important enough to be outside of the
table below), emitted when the next track in a DJ set has started. There are
various conditions for this to have happened outlined below:

- Track A is play and Track B is brought in playing and is on air. After a
  configurable number of beats have elapsed Track B will be reported as now
  playing. If Track B was not on air after the configured number of beats
  elapsed it will not be reported as now playing.

- Track A is playing and Track B is brought in playing and is on air. If
  track A is cued Track B will immediately be reported as now playing.

- Track A is playing and Track B is brought in playing and is on air. If
  track A is paused or goes off air, after the configured number of interrupt
  beats has passed Track B will be reported as now playing.

  The interrupt beats allow for a Track A to be taken "off air" (paused,
  fader-cut, etc) for small moments of time _without_ Track B being immediately
  reported as playing. This is useful for example, cutting only parts of track
  B in to tease the audience.

| Event         | Description                                                                                                                                                                                                                                                                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stopped`     | Emitted when a track stops playing. This is either that the track has been cued, unloaded from the deck, or has been taken off air for long enough that the configured interrupt interval has elapsed and the track is not considered on air anymore, even if it is still playing on the player.                                                                           |
| `coming_soon` | Emitted when the previously stopped track has been replaced by a new track, indicating that the DJ has selected his next track and is prepared to make the transition from the currently playing track. This event will include the track details, but depending on the application, the client may wish to hide this to keep the 'coming soon' mystery of the transition. |
| `set_started` | Emitted when a new DJ set has started. This implies that no tracks had been playing for the period of time configured between sets and that a track has been started and is on-air.                                                                                                                                                                                        |
| `set_ended`   | Emitted when the DJ set has ended. This implies that no tracks were live for the configured period of time after some track had been playing.                                                                                                                                                                                                                              |

### HTTP API

In addition to the websocket API for receiving events, the following HTTP
endpoints are also exposed for interacting with the PROLINK network.

<details>
  <summary>
    <code>GET /devices</code>
    <p>
      Retrieves the list of all active devices on the PROLINK network.
    </p>
  </summary>

  <pre lang="json">[
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
]</pre>
</details>

<details id="get-track">
  <summary>
    <code>POST /track</code>
    <p>
      Queries the network for details about a particular track query.
    </p>
  </summary>

  <pre lang="HTTP">POST /track HTTP1.1

{
  "id": 14,
  "device": 1,
  "slot": "usb"
}</pre>

  <pre lang="json">{
  "id": 14,
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

### Configuration

The server is configured at runtime via the `/config` API endpoint.

<details>
  <summary>
    <code>GET /config</code>
    <p>
      Retrieves the current server configuration.<br />Includes some additional
      information to provide knowledge of configuration values, such as the
      list of available network devices to listen on.
    </p>
  </summary>

  <pre lang="json">{
  "interface": "enp0",
  "player_id": 2,
  "available_interfaces": ["enp0", "bridge0"],
  "unused_player_ids": [2, 3],
  "mix_status": {
    "allowed_interrupt_beats": 8,
    "beats_until_reported": 128,
    "time_between_sets": 360
  }
}</pre>
</details>

<details>
  <summary>
    <code>PUT /config</code>
    <p>
      Updates the server configuration with new values.<br />Not all values need to
      be included in the request JUST body. Omitted configuration keys will not
      be changed.
    </p>
  </summary>

  <pre lang="http">PUT /config HTTP/1.1

{
  "interface": "bridge0",
  "player_id": 1,
  "mix_status": {
    "allowed_interrupt_beats": 16,
    "beats_until_reported": 64,
    "time_between_sets": 120
  }
}</pre>
</details>

#### Network configuration

- `interface`

  Interface specifies what network interface the server should use to broadcast
  itself over the network. It's important that this be configured to the
  interface that is on the same network as other PROLINK equipment, otherwise
  the server will not be recognized by the equipment as being on the network
  and will not receive status information from players.

- `player_id`

  The Player ID that the server will broadcast itself as. The server emulates a
  CDJ on the network in order to become part of the network, this "virtual CDJ"
  must have a player number, this should _not_ overlap with any of the CDJ
  player IDs in your setup.

  This may be null if the `player_id` has not yet been configured.

#### `mix_status` configuration

Configuration for the [mix status functionality](#mix-status):

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
  not be reported as started until the configured interrupt beats pass (unless
  the cut track is cued or pauses).

- `beats_until_reported`

  The number of beats until a track is to be considered to be "now playing".
  For example if this is configure to 128 beats (32 bars) and you are ready to
  transition from track A to track B, once track B has been playing for 32
  bars, and the track is live and on-air (the CDJs jogwheel is red).

- `time_between_sets`

  Time in seconds until the `set_ended` status will be reported after all
  tracks have been stopped from playing.

#### Automatic configuration

`POST /config/autodetect`

The `interface` and `player_id` may be automatically configured for the server
by POSTing to the `/config/autodetect` endpoint. This will cause the server to
locate the interface which is on the same subnet as the first player connected
on the network, and choose a Player ID that is not on the network.

### Building and running

Ensure that you have [`dep`](https://github.com/golang/dep) installed as it is used to vendor packages.

```shell
$ git clone https://github.com/EvanPurkhiser/prolink-tools.git $GOPATH/src/go.evanpurkhiser.com/prolink-tools
$ cd $GOPATH/src/go.evanpurkhiser.com/prolink-tools/server
$ dep ensure
$ make

# Start the server
./prolink-server
```
