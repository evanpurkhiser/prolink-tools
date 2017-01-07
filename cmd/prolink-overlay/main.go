package main

import (
	"net/http"

	"go.evanpurkhiser.com/prolink"
	"go.evanpurkhiser.com/prolink-overlay"
	"go.evanpurkhiser.com/prolink/trackstatus"
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

	wss := overlay.NewWebsocketServer()
	http.Handle("/status", wss)

	statusMapper := overlay.StatusMapper{
		Network:           network,
		TrackStatusConfig: tsConfig,
		MessageHandler:    wss.SendJSONMessage,
	}

	statusMapper.Start()

	http.ListenAndServe(":8033", nil)
}
