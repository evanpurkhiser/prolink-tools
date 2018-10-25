VERSION := $(shell git rev-parse --short HEAD:./)

dist/prolink-server:
	mkdir -p dist
	go mod download
	go build  -mod=readonly -ldflags "-X main.Version=$(VERSION)" -o $@ cmd/prolink-server/main.go
