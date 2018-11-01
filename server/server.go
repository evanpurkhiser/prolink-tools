package server

import (
	"fmt"
	"net/http"
	"time"

	"github.com/getsentry/raven-go"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/inconshreveable/log15"
	"go.evanpurkhiser.com/prolink"
	"go.evanpurkhiser.com/prolink/mixstatus"
)

// Log is the logger that must be configured for logs to be outputted.
var Log log15.Logger

// Config specifies configuration needed to construct and start a
// prolink server.
type Config struct {
	Port int
}

// NewServer constructs a prolink Server. This does not yet bind the server to
// a port or wait for requests.
func NewServer(network *prolink.Network, config Config) *Server {
	// Default mixstatus configuration. This will be updated by the server
	// should a configuration be persisted from a previous session.
	mixStatusConfig := mixstatus.Config{
		AllowedInterruptBeats: 10,
		BeatsUntilReported:    128,
		TimeBetweenSets:       1 * time.Minute,
	}

	mixStatus := mixstatus.NewProcessor(mixStatusConfig, nil)
	network.CDJStatusMonitor().AddStatusHandler(mixStatus)

	emitter := NewEventEmitter(network, mixStatus)

	return &Server{
		config:    config,
		network:   network,
		mixStatus: mixStatus,
		emitter:   emitter,
	}
}

// Server is the primary HTTP server object.
type Server struct {
	config    Config
	network   *prolink.Network
	mixStatus *mixstatus.Processor
	emitter   *EventEmitter
}

type services struct {
	network   *prolink.Network
	mixStatus *mixstatus.Processor
	emitter   *EventEmitter
}

func (s *Server) handlerWithServices(fn handler) http.Handler {
	services := services{
		network:   s.network,
		mixStatus: s.mixStatus,
		emitter:   s.emitter,
	}

	handler := func(w http.ResponseWriter, r *http.Request) {
		fn(w, r, services)
	}

	return http.HandlerFunc(raven.RecoveryHandler(handler))
}

func (s *Server) makeRoutes() http.Handler {
	router := mux.NewRouter()

	for _, r := range []struct {
		method  string
		path    string
		handler handler
	}{
		{"GET", "/devices", listDevices},
		{"GET", "/config", getConfig},
		{"PUT", "/config", setConfig},
		{"POST", "/config", autoConfigure},
		{"POST", "/track", getTrack},
		{"GET", "/events/history", getEventHistory},
	} {
		router.
			Methods(r.method).
			Path(r.path).
			Handler(s.handlerWithServices(r.handler))
	}

	router.Handle("/events", s.emitter)

	return handlers.CORS()(router)
}

// Start starts the server.
func (s *Server) Start() error {
	router := s.makeRoutes()

	Log.Info("HTTP server started", "port", s.config.Port)
	return http.ListenAndServe(fmt.Sprintf(":%d", s.config.Port), router)
}

type handler func(http.ResponseWriter, *http.Request, services)
