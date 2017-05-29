.PHONY: build

build:
	npm run build --prefix overlay/
	go build -o dist/prolink-overlay cmd/prolink-overlay/main.go
	rice append --import-path=go.evanpurkhiser.com/prolink-overlay/cmd/prolink-overlay --exec=dist/prolink-overlay
