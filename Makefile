.PHONY: build

build:
	cd overlay && yarn build
	go build -o dist/prolink-overlay cmd/prolink-overlay/main.go
	rice append --import-path=go.evanpurkhiser.com/prolink-overlay/cmd/prolink-overlay --exec=dist/prolink-overlay
