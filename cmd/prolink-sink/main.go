package main

import (
	"net/http"

	"go.evanpurkhiser.com/prolink"
	"go.evanpurkhiser.com/prolink/trackstatus"
	"go.evanpurkhiser.com/prolinksink"
)

func main() {
	prolinkConfig := prolink.Config{
		VirtualCDJID: 0x04,
	}

	network, err := prolink.Connect(prolinkConfig)
	if err != nil {
		panic(err)
	}

	tsConfig := trackstatus.Config{
		AllowedInterruptBeats: 10,
		BeatsUntilReported:    128,
	}

	wss := prolinksink.NewWebsocketServer()
	http.Handle("/status", wss)

	statusMapper := prolinksink.StatusMapper{
		Network:           network,
		TrackStatusConfig: tsConfig,
		MessageHandler:    wss.SendJSONMessage,
	}

	statusMapper.Start()

	http.ListenAndServe(":8080", nil)
}
