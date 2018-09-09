## Prolink Server

`prolink-server` is a daemon that provides a unified HTTP + websocket API for
communicating with devices on the PROLINK network. This tool uses the
[`prolink-go`](https://github.com/EvanPurkhiser/prolink-go) library and is
constrained to the limitations of the library.

### Usage

When started the server will attempt to auto-configure itself by looking for
active PROLINK devices on the network

#### Configuration

- `GET /devices`
  Retrieves the list of active devices on the PROLINK network.

  ```json
  [
  ```

- `GET /config`

- `PUT /config`

- `POST /config/autoconfigure`

Making this request will ask the prolink server to re-detech

- `GET /ws/events`

- `GET /ws/player_events`
