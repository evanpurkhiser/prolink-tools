VERSION := $(shell git rev-parse --short HEAD:./)

prolink-server:
	go build  -ldflags "-X main.Version=$(VERSION)" -o $@ cmd/prolink-server/main.go
