build:
	GOOS=js GOARCH=wasm ${BINARY_PATH}go build -o bridge.wasm main.go
	mv bridge.wasm ./bin
	
serve:
	GOOS=darwin GOARCH=amd64 ${BINARY_PATH}go run ./tools/server.go