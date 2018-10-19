VERSION := $(shell git rev-parse --short HEAD:./)

dist/prolink-overlay.html:
	yarn install
	VERSION=${VERSION} yarn build
