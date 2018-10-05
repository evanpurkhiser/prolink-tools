VERSION := $(shell git rev-parse --short HEAD:./)

dist/prolink-server:
	mkdir -p dist
	go build  -ldflags "-X main.Version=$(VERSION)" -o $@ cmd/prolink-server/main.go
