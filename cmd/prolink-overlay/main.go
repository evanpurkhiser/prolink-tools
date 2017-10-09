package main

import (
	"flag"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/GeertJohan/go.rice"
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
	"go.evanpurkhiser.com/prolink"

	"go.evanpurkhiser.com/prolink-overlay/server"
	"go.evanpurkhiser.com/prolink/trackstatus"
)

// webpackDevServer specifies the HTTP address of the webpack dev server. When
// the webpack-proxy flag is enabled content will be proxied to the dev server.
const webpackDevServer = "http://localhost:9000"

var webpackProxyEnabled = flag.Bool("webpack-proxy", false, "Proxy to the webpack dev server")

func main() {
	flag.Parse()

	prolinkConfig := prolink.Config{
		VirtualCDJID: 0x03,
	}

	network, err := prolink.Connect(prolinkConfig)
	if err != nil {
		panic(err)
	}

	logrus.Info("Connected to prolink network")

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
	if !*webpackProxyEnabled {
		return http.FileServer(rice.MustFindBox("../../dist/assets").HTTPBox())
	}

	target, _ := url.Parse(webpackDevServer)

	return httputil.NewSingleHostReverseProxy(target)
}
