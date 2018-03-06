VERSION := $(shell git rev-parse --short HEAD)

go-deps:
	dep ensure

js-deps:
	cd overlay && yarn install

deps: js-deps go-deps

dist/assets:
	rm -rf dist/assets
	cd overlay && yarn build

dist/prolink-overlay-dev:
	go build  -ldflags "-X main.Version=$(VERSION)" -o $@ cmd/prolink-overlay/main.go

dist/prolink-overlay: dist/assets dist/prolink-overlay-dev
	mv dist/prolink-overlay-dev $@
	rice append --import-path=go.evanpurkhiser.com/prolink-overlay/cmd/prolink-overlay --exec=$@

.PHONY: go-deps js-deps
