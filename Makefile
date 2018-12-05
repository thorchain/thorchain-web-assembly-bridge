prepare:
	dep ensure
	cp -R vendor_patches/* vendor

build:
	GOOS=js GOARCH=wasm ${BINARY_PATH}go build -tags netgo -o thorchain_bridge.wasm main.go
	mkdir -p ./js/dist
	mv thorchain_bridge.wasm ./js/dist
