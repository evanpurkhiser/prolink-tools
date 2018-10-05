VERSION := $(shell git rev-parse --short HEAD:./)

dist/prolink-server:
	mkdir -p dist
	dep ensure
	go build  -ldflags "-X main.Version=$(VERSION)" -o $@ cmd/prolink-server/main.go
