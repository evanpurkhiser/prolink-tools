package main

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	"github.com/GeertJohan/go.rice"
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
	"go.evanpurkhiser.com/prolink"

	"go.evanpurkhiser.com/prolink-overlay/server"
	"go.evanpurkhiser.com/prolink/trackstatus"
)

const webpackDevServer = "http://localhost:9000"

// Version declares the revision of the software. Set at compile time.
var Version = "dev"

func main() {
	logrus.Infof("Running version %s", Version)

	network, err := prolink.Connect()
	if err != nil {
		panic(err)
	}

	logrus.Info("Connected to prolink network, autoconfiguring...")

	if err := network.AutoConfigure(3 * time.Second); err != nil {
		logrus.Error(err)
	} else {
		logrus.Infof("Listening on interface %q", network.TargetInterface.Name)
		logrus.Infof("Reporting as Virtual CDJ ID %d", network.VirtualCDJID)
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
	router.NewRoute().Handler(getStaticHandler())

	http.ListenAndServe(":8080", router)
}

// getStaticHandler determines if a overlay proxie is configured, if so all
// requests will be proxied through the URL, otherwise the rice will be served.
func getStaticHandler() http.Handler {
	box, _ := rice.FindBox("../../dist/assets")
	if box != nil {
		return http.FileServer(box.HTTPBox())
	}

	target, _ := url.Parse(webpackDevServer)

	return httputil.NewSingleHostReverseProxy(target)
}
