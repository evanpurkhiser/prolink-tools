package overlay

import (
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// NewWebsocketServer constructs a WebsocketServer.
func NewWebsocketServer() *WebsocketServer {
	wsServer := WebsocketServer{
		conns:    map[*websocket.Conn]bool{},
		connLock: sync.Mutex{},
	}

	return &wsServer
}

// WebsocketServer implements the http.Handler interface and will convert
// requests to a websocket connection, providing methods to send JSON to all
// connected clients.
type WebsocketServer struct {
	conns    map[*websocket.Conn]bool
	connLock sync.Mutex

	// newClientMessages is a function called that is expected to return a list
	// of objects that will be sent to the client upon connecting.
	newClientMessages func() []interface{}
}

// ServeHTTP implements the http.Handler interface.
func (s *WebsocketServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	s.connLock.Lock()
	defer s.connLock.Unlock()

	s.conns[conn] = true
	go s.closeWaiter(conn)

	if s.newClientMessages == nil {
		return
	}

	// Write all messages as an array. The websocket listener will understand
	// an array of messages
	conn.WriteJSON(s.newClientMessages())
}

func (s *WebsocketServer) closeWaiter(conn *websocket.Conn) {
	// Do nothing until the connection is closed
	for _, _, err := conn.ReadMessage(); err == nil; {
	}

	conn.Close()
	delete(s.conns, conn)
}

// SendJSONMessage broadcasts a message to all connected clients.
func (s *WebsocketServer) SendJSONMessage(object interface{}) {
	s.connLock.Lock()
	defer s.connLock.Unlock()

	for conn := range s.conns {
		conn.WriteJSON(object)
	}
}

func (s *WebsocketServer) SetNewClientHandler(ch func() []interface{}) {
	s.newClientMessages = ch
}
