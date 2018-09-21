package server

import (
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"go.evanpurkhiser.com/prolink"
	"go.evanpurkhiser.com/prolink/mixstatus"
)

// upgrade is used to upgrade a HTTP connection to a websocket connection.
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// EventClient represents a single connected client.
type EventClient struct {
	// subscriptions is the list of events that this client is currently
	// subscribed to.
	subscriptions []string

	// conn is the open websocket connection
	conn *websocket.Conn
}

// recieveMessage waits to recieve messages over the connection. This method is
// responsible for updating the list of event subscriptions for the client.
func (c *EventClient) recieveMessage() error {
	subs := &subscriptions{}

	if err := c.conn.ReadJSON(subs); err != nil {
		return err
	}

	c.subscriptions = subs.Subscriptions

	Log.Debug("Subscriptions updated for client",
		"subscriptions", c.subscriptions,
		"addr", c.conn.RemoteAddr(),
	)

	return nil
}

// hasSubscription checks if this client is current subscribed to a particular
// event type.
func (c *EventClient) hasSubscription(eventType string) bool {
	for _, checkType := range c.subscriptions {
		if checkType == eventType {
			return true
		}
	}

	return false
}

// EventEmitter is responsible for delegating events to clients with the
// appropriate subscriptions.
type EventEmitter struct {
	clients  map[*websocket.Conn]*EventClient
	connLock sync.Mutex
}

// ServeHTTP implements the http.Handler interface.
func (e *EventEmitter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	Log.Info("New websocket connection opened", "addr", conn.RemoteAddr())

	e.connLock.Lock()
	defer e.connLock.Unlock()

	e.clients[conn] = &EventClient{
		subscriptions: []string{},
		conn:          conn,
	}

	go e.reader(conn)
}

// reader continuously reads messages from an emitter client.
func (e *EventEmitter) reader(conn *websocket.Conn) {
	for {
		err := e.clients[conn].recieveMessage()

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				Log.Warn("Error reading from websocket", "error", err)
			}
			break
		}
	}

	Log.Info("Closing websocket", "addr", conn.RemoteAddr())

	e.connLock.Lock()
	defer e.connLock.Unlock()

	conn.Close()
	delete(e.clients, conn)
}

func (e *EventEmitter) emittEvent(event event) {
	e.connLock.Lock()
	defer e.connLock.Unlock()

	Log.Debug("Emitting event", "type", event.Type, "data", event.Data)

	for _, client := range e.clients {
		if !client.hasSubscription(event.Type) {
			continue
		}

		err := client.conn.WriteJSON(event)

		if err != nil {
			Log.Warn(
				"Failed to emit event to websocket",
				"addr", client.conn.RemoteAddr(),
				"error", err,
			)
		}
	}
}

// CDJStatusEmitter emits events to the EventEmitter any time a particular
// attribute of any CDJ player changes.
type CDJStatusEmitter struct {
	emitter        *EventEmitter
	prevStatus     map[prolink.DeviceID]*prolink.CDJStatus
	prevStatusLock *sync.Mutex
}

// OnStatusUpdate implements the prolink.StatusHandler interface.
func (e *CDJStatusEmitter) OnStatusUpdate(status *prolink.CDJStatus) {
	e.prevStatusLock.Lock()
	defer e.prevStatusLock.Unlock()

	prevStatus := e.prevStatus[status.PlayerID]

	if prevStatus == nil {
		e.prevStatus[status.PlayerID] = status
		return
	}

	playerId := &status.PlayerID

	if prevStatus.TrackID != status.TrackID {
		e.emitter.emittEvent(mapEvent(
			"status:track_key",
			playerId,
			mapTrackKey(status),
		))
	}

	if prevStatus.PlayState != status.PlayState {
		e.emitter.emittEvent(mapEvent(
			"status:play_state",
			playerId,
			status.PlayState.String(),
		))
	}

	if prevStatus.TrackBPM != status.TrackBPM {
		e.emitter.emittEvent(mapEvent(
			"status:bpm",
			playerId,
			status.TrackBPM,
		))
	}

	if prevStatus.SliderPitch != status.SliderPitch {
		e.emitter.emittEvent(mapEvent(
			"status:pitch",
			playerId,
			status.SliderPitch,
		))
	}

	if prevStatus.EffectivePitch != status.EffectivePitch {
		e.emitter.emittEvent(mapEvent(
			"status:effective_pitch",
			playerId,
			status.EffectivePitch,
		))
	}

	if prevStatus.IsOnAir != status.IsOnAir {
		e.emitter.emittEvent(mapEvent(
			"status:on_air",
			playerId,
			status.IsOnAir,
		))
	}

	if prevStatus.IsSync != status.IsSync {
		e.emitter.emittEvent(mapEvent(
			"status:sync_enabled",
			playerId,
			status.IsSync,
		))
	}

	if prevStatus.IsMaster != status.IsMaster {
		e.emitter.emittEvent(mapEvent(
			"status:is_master",
			playerId,
			status.IsMaster,
		))
	}

	if prevStatus.Beat != status.Beat {
		e.emitter.emittEvent(mapEvent(
			"status:beat",
			playerId,
			mapBeat(status),
		))
	}

	e.prevStatus[status.PlayerID] = status
}

// DeviceChangeEmitter emits events to the EventEmitter any time a device
// changes it's existence on the network.
type DeviceChangeEmitter struct {
	emitter    *EventEmitter
	changeType string
}

// OnChange implements the prolink.DeviceListener interface.
func (e *DeviceChangeEmitter) OnChange(dev *prolink.Device) {
	e.emitter.emittEvent(mapEvent(
		e.changeType,
		nil,
		mapDevice(dev),
	))
}

// MixStatusEmitter emits events to the EventEmitter any time the mix status
// processor reports a new status.
type MixStatusEmitter struct {
	emitter  *EventEmitter
	remoteDB *prolink.RemoteDB
}

// OnMixStatus implements the mixstatus.Handler interface.
func (e *MixStatusEmitter) OnMixStatus(event mixstatus.Event, status *prolink.CDJStatus) {
	nullPlayerEvents := map[mixstatus.Event]bool{
		mixstatus.SetStarted: true,
		mixstatus.SetEnded:   true,
		mixstatus.Stopped:    true,
	}

	if _, ok := nullPlayerEvents[event]; ok {
		e.emitter.emittEvent(mapEvent(string(event), nil, nil))
		return
	}

	trackEvents := map[mixstatus.Event]bool{
		mixstatus.NowPlaying: true,
		mixstatus.ComingSoon: true,
	}

	if _, ok := trackEvents[event]; ok {
		t, err := e.remoteDB.GetTrack(status.TrackKey())
		if err != nil {
			Log.Error("Failed to retrieve track from Remote DB", "error", err)
		}

		e.emitter.emittEvent(mapEvent(
			string(event),
			&status.PlayerID,
			mapTrack(t),
		))

		return
	}

	Log.Warn("Got unhandled mix status event", "event", event)
}

// NewEventEmitter creates an EventEmitter. Binding the CDJStatusEmitter,
// DeviceChangeEmitter, and MixStatusEmitter to the emitter using the provided
// services.
func NewEventEmitter(network *prolink.Network, ms *mixstatus.Processor) *EventEmitter {
	emitter := &EventEmitter{
		clients:  map[*websocket.Conn]*EventClient{},
		connLock: sync.Mutex{},
	}

	network.CDJStatusMonitor().AddStatusHandler(&CDJStatusEmitter{
		emitter:        emitter,
		prevStatus:     map[prolink.DeviceID]*prolink.CDJStatus{},
		prevStatusLock: &sync.Mutex{},
	})

	dm := network.DeviceManager()

	dm.OnDeviceAdded(
		"prolink-server-emitter",
		&DeviceChangeEmitter{
			emitter:    emitter,
			changeType: "device_added",
		},
	)

	dm.OnDeviceRemoved(
		"prolink-server-emitter",
		&DeviceChangeEmitter{
			emitter:    emitter,
			changeType: "device_removed",
		},
	)

	ms.SetHandler(&MixStatusEmitter{
		emitter:  emitter,
		remoteDB: network.RemoteDB(),
	})

	return emitter
}
