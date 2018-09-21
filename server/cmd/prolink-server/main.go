package main

import (
	"time"

	"github.com/getsentry/raven-go"
	"github.com/inconshreveable/log15"
	"github.com/spf13/cobra"
	"go.evanpurkhiser.com/prolink"

	"go.evanpurkhiser.com/prolink-tools/server"
)

// Version declares the revision of the software. This variable will be updated
// at compile time.
var Version = "dev"

func startServer(cmd *cobra.Command, args []string) error {
	var log = log15.New()

	logLevel := log15.LvlInfo

	if debug, _ := cmd.Flags().GetBool("debug"); debug {
		logLevel = log15.LvlDebug
	}

	log.SetHandler(log15.LvlFilterHandler(
		logLevel,
		log15.StdoutHandler,
	))

	log.Info("Starting prolink server", "version", Version)

	prolink.Log = log.New("module", "prolink")

	network, err := prolink.Connect()
	if err != nil {
		panic(err)
	}

	go func() {
		log.Info("Attempting to auto configure...")
		if err := network.AutoConfigure(3 * time.Second); err != nil {
			log.Warn(err.Error())
		}
	}()

	port, _ := cmd.Flags().GetInt("port")

	config := server.ServerConfig{
		Port: port,
	}

	server.Log = log
	prolinkServer := server.NewServer(network, config)

	return prolinkServer.Start()
}

func setupSentry() {
	raven.SetDSN("https://5f4bb68c9b1d474ba2adc511885d9000:da119d611a3e41c19466dba5c1ce6000@sentry.io/279153")

	if Version == "dev" {
		raven.SetEnvironment("development")
	} else {
		raven.SetEnvironment("production")
		raven.SetRelease(Version)
	}
}

func main() {
	setupSentry()

	var rootCmd = &cobra.Command{
		Use:   "prolink-server",
		Short: "prolink-server provides a HTTP / websocket interface to a prolink network.",
		RunE:  startServer,
	}

	flags := rootCmd.Flags()
	flags.IntP("port", "p", 8000, "port to start the HTTP server on")
	flags.BoolP("debug", "d", false, "enables debug output")

	raven.CapturePanic(func() {
		err := rootCmd.Execute()
		raven.CaptureErrorAndWait(err, nil)
	}, nil)
}
