build:
	GOOS=js GOARCH=wasm ${BINARY_PATH}go build -o thorchain_bridge.wasm main.go
	mv thorchain_bridge.wasm ./bin
	yarn --cwd ./js build
	
serve:
	GOOS=darwin GOARCH=amd64 ${BINARY_PATH}go run ./tools/server.go