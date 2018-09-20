package server

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/inconshreveable/log15"
	"go.evanpurkhiser.com/prolink"
	"go.evanpurkhiser.com/prolink/mixstatus"
)

// Log is the logger that must be configured for logs to be outputted.
var Log log15.Logger

// ServerConfig specifies configuration needed to construct and start a
// pronlink server.
type ServerConfig struct {
	Port int
}

// NewServer constructs a prolink Server. This does not yet bind the server to
// a port or wait for rquests.
func NewServer(network *prolink.Network, config ServerConfig) *Server {
	// Default mixstatus configuration. This will be updated by the server
	// should a configuration be persisted from a previous session.
	mixStatusConfig := mixstatus.Config{
		AllowedInterruptBeats: 10,
		BeatsUntilReported:    128,
		TimeBetweenSets:       1 * time.Minute,
	}

	mixStatus := mixstatus.NewProcessor(mixStatusConfig, nil)
	network.CDJStatusMonitor().AddStatusHandler(mixStatus)

	return &Server{
		config:    config,
		network:   network,
		mixStatus: mixStatus,
	}
}

type Server struct {
	config    ServerConfig
	network   *prolink.Network
	mixStatus *mixstatus.Processor
}

func (s *Server) handlerWithContext(fn handler) http.Handler {
	c := context{
		network:   s.network,
		mixStatus: s.mixStatus,
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fn(w, r, c)
	})
}

func (s *Server) makeRoutes() *mux.Router {
	router := mux.NewRouter()

	routes := []struct {
		method  string
		path    string
		handler handler
	}{
		{"GET", "/config", getConfig},
		{"PUT", "/config", setConfig},
		{"POST", "/config/auto", autoConfigure},
		{"GET", "/devices", listDevices},
	}

	for _, r := range routes {
		router.
			Methods(r.method).
			Path(r.path).
			Handler(s.handlerWithContext(r.handler))
	}

	router.Handle("/events", NewEventEmitter(s.network, s.mixStatus))

	return router
}

func (s *Server) Start() error {
	router := s.makeRoutes()

	Log.Info("HTTP server started", "port", s.config.Port)
	return http.ListenAndServe(fmt.Sprintf(":%d", s.config.Port), router)
}

type context struct {
	network   *prolink.Network
	mixStatus *mixstatus.Processor
}

type handler func(http.ResponseWriter, *http.Request, context)
