package main

import (
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/inconshreveable/log15"
	"github.com/sirupsen/logrus"
	"go.evanpurkhiser.com/prolink"

	"go.evanpurkhiser.com/prolink-tools/server"
	"go.evanpurkhiser.com/prolink/trackstatus"
)

// Version declares the revision of the software. Set at compile time.
var Version = "dev"

// Log is used for logging
var Log = log15.New()

func init() {
	Log.SetHandler(log15.LvlFilterHandler(
		log15.LvlInfo,
		log15.StdoutHandler,
	))
}

func main() {
	Log.Info("Starting prolink server", Version)

	prolink.Log = log15.New("module", "prolink-lib")

	network, err := prolink.Connect()
	if err != nil {
		panic(err)
	}

	if err := network.AutoConfigure(3 * time.Second); err != nil {
		Log.Error(err.Error())
	}

	deviceLogger := func(dev *prolink.Device) {
		log := logrus.WithFields(logrus.Fields{
			"device": dev,
		})

		log.Info("New device detected on network")
	}

	network.DeviceManager().OnDeviceAdded(prolink.DeviceListenerFunc(
		deviceLogger,
	))

	tsConfig := trackstatus.Config{
		AllowedInterruptBeats: 10,
		BeatsUntilReported:    128,
		TimeBetweenSets:       5 * time.Second,
	}

	wss := server.NewWebsocketServer()

	statusMapper := server.StatusMapper{
		Network:           network,
		TrackStatusConfig: tsConfig,
		MessageHandler:    wss.SendJSONMessage,
	}

	wss.SetNewClientHandler(statusMapper.LastMessages)

	statusMapper.Start()
	logrus.Info("Listening for status on prolink network")

	router := mux.NewRouter()
	router.Handle("/status", wss)

	http.ListenAndServe(":8080", router)
}
