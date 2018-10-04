package server

import (
	"fmt"
	"net"
)

func getInterfaceByName(iface string) (*net.Interface, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return nil, err
	}

	for _, possibleIface := range ifaces {
		if possibleIface.Name == iface {
			return &possibleIface, nil
		}
	}

	return nil, fmt.Errorf("Invalid interface name %q", iface)
}

func getInterfaceList() ([]string, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return nil, err
	}

	interfaces := []string{}

	for _, iface := range ifaces {
		interfaces = append(interfaces, iface.Name)
	}

	return interfaces, nil
}
