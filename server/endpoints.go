package server

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"time"

	"go.evanpurkhiser.com/prolink"
)

type errorResp struct {
	Error string `json:"error"`
}

func respondWithError(w http.ResponseWriter, err error) {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(errorResp{Error: err.Error()})
}

func getConfig(w http.ResponseWriter, r *http.Request, c context) {
	cfg := mapConfig(c.network, c.mixStatus)

	ifaces, err := net.Interfaces()
	if err != nil {
		respondWithError(w, fmt.Errorf("Unable to retrieve list of network interfaces"))
		return
	}

	interfaces := []string{}

	for _, iface := range ifaces {
		interfaces = append(interfaces, iface.Name)
	}

	devices := c.network.DeviceManager().ActiveDeviceMap()
	openDevices := []int{}

	for _, possiblyAvailable := range []int{1, 2, 3, 4} {
		if _, ok := devices[prolink.DeviceID(possiblyAvailable)]; !ok {
			openDevices = append(openDevices, possiblyAvailable)
		}
	}

	cfgAnnotated := configAnnotated{
		config:              cfg,
		AvailableInterfaces: interfaces,
		UnusedPlayerIDs:     openDevices,
	}

	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cfgAnnotated)
}

func setConfig(w http.ResponseWriter, r *http.Request, c context) {
	cfg := &config{}

	if err := json.NewDecoder(r.Body).Decode(cfg); err != nil {
		respondWithError(w, fmt.Errorf("JSON decode error: %s", err))
		return
	}

	// Configure the network interface to bind to
	if cfg.Interface != "" {
		ifaces, err := net.Interfaces()
		if err != nil {
			respondWithError(w, fmt.Errorf("Unable to retrieve list of network interfaces"))
			return
		}

		interfaceSet := false

		for _, iface := range ifaces {
			if iface.Name == cfg.Interface {
				interfaceSet = true
				err = c.network.SetInterface(&iface)
				break
			}
		}

		if err != nil {
			respondWithError(w, err)
			return
		}

		if !interfaceSet {
			respondWithError(w, fmt.Errorf("Invalid interface: %s", cfg.Interface))
			return
		}
	}

	// Configure the player ID to use
	if cfg.PlayerID != 0 {
		c.network.SetVirtualCDJID(prolink.DeviceID(cfg.PlayerID))
	}

	if cfg.MixStatus.AllowedInterruptBeats != nil {
		c.mixStatus.Config.AllowedInterruptBeats = *cfg.MixStatus.AllowedInterruptBeats
	}

	if cfg.MixStatus.BeatsUntilReported != nil {
		c.mixStatus.Config.BeatsUntilReported = *cfg.MixStatus.BeatsUntilReported
	}

	if cfg.MixStatus.TimeBetweenSets != nil {
		c.mixStatus.Config.TimeBetweenSets = time.Duration(*cfg.MixStatus.TimeBetweenSets) * time.Second
	}

	newCfg := mapConfig(c.network, c.mixStatus)

	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newCfg)
}

func autoConfigure(w http.ResponseWriter, r *http.Request, c context) {
	err := c.network.AutoConfigure(0)
	if err != nil {
		respondWithError(w, err)
		return
	}

	cfg := mapConfig(c.network, c.mixStatus)

	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cfg)
}

func listDevices(w http.ResponseWriter, r *http.Request, c context) {
	dm := c.network.DeviceManager()

	activeDevices := []device{}

	for _, dev := range dm.ActiveDevices() {
		activeDevices = append(activeDevices, mapDevice(dev))
	}

	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activeDevices)
}
