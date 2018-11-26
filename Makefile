prepare:
	dep ensure
	cp -R vendor_patches/* vendor

build:
	GOOS=js GOARCH=wasm ${BINARY_PATH}go build -tags netgo -o thorchain_bridge.wasm main.go
	mv thorchain_bridge.wasm ./bin
	cd ./js; yarn
	yarn --cwd ./js build

serve:
	GOOS=darwin GOARCH=amd64 ${BINARY_PATH}go run ./tools/server.go