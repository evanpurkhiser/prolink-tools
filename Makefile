.PHONY: build

VERSION := $(shell git rev-parse --short HEAD)

build:
	cd overlay && yarn build
	go build  -ldflags "-X main.Version=$(VERSION)" -o dist/prolink-overlay cmd/prolink-overlay/main.go
	rice append --import-path=go.evanpurkhiser.com/prolink-overlay/cmd/prolink-overlay --exec=dist/prolink-overlay
