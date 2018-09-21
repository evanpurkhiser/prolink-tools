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

func respondError(w http.ResponseWriter, err error) {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(errorResp{Error: err.Error()})
}

func respondJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func getConfig(w http.ResponseWriter, r *http.Request, s services) {
	cfg := mapConfig(s.network, s.mixStatus)

	ifaces, err := getInterfaceList()
	if err != nil {
		respondError(w, err)
		return
	}

	devices := s.network.DeviceManager().ActiveDeviceMap()
	openDevices := []int{}

	for _, possiblyAvailable := range []int{1, 2, 3, 4} {
		if _, ok := devices[prolink.DeviceID(possiblyAvailable)]; !ok {
			openDevices = append(openDevices, possiblyAvailable)
		}
	}

	respondJSON(w, configAnnotated{
		config:              cfg,
		AvailableInterfaces: ifaces,
		UnusedPlayerIDs:     openDevices,
	})
}

func setConfig(w http.ResponseWriter, r *http.Request, s services) {
	cfg := &config{}

	if err := json.NewDecoder(r.Body).Decode(cfg); err != nil {
		respondError(w, fmt.Errorf("JSON decode error: %s", err))
		return
	}

	// Configure the network interface to bind to
	if cfg.Interface != "" {
		iface, err := getInterfaceByName(cfg.Interface)
		if err != nil {
			respondError(w, err)
			return
		}

		if err = s.network.SetInterface(iface); err != nil {
			respondError(w, err)
			return
		}
	}

	// Configure the player ID to use
	if cfg.PlayerID != 0 {
		s.network.SetVirtualCDJID(prolink.DeviceID(cfg.PlayerID))
	}

	if cfg.MixStatus.AllowedInterruptBeats != nil {
		v := cfg.MixStatus.AllowedInterruptBeats
		s.mixStatus.Config.AllowedInterruptBeats = *v
	}

	if cfg.MixStatus.BeatsUntilReported != nil {
		v := cfg.MixStatus.BeatsUntilReported
		s.mixStatus.Config.BeatsUntilReported = *v
	}

	if cfg.MixStatus.TimeBetweenSets != nil {
		v := time.Duration(*cfg.MixStatus.TimeBetweenSets) * time.Second
		s.mixStatus.Config.TimeBetweenSets = v
	}

	respondJSON(w, mapConfig(s.network, s.mixStatus))
}

func autoConfigure(w http.ResponseWriter, r *http.Request, s services) {
	err := s.network.AutoConfigure(0)
	if err != nil {
		respondError(w, err)
		return
	}

	respondJSON(w, mapConfig(s.network, s.mixStatus))
}

func listDevices(w http.ResponseWriter, r *http.Request, s services) {
	dm := s.network.DeviceManager()

	activeDevices := []device{}

	for _, dev := range dm.ActiveDevices() {
		activeDevices = append(activeDevices, mapDevice(dev))
	}

	respondJSON(w, activeDevices)
}
