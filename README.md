# thorchain-wasm-bridge
Bridge for building, signing and encoding tendermint messages in the browser 

### Build the web assembly binary
```
$ dep ensure
$ make build
// stored in ./bin/bridge.wasm
```

### Build the Javascript library
```
$ cd js
$ npm install
$ npm run build
// stored in ./js/lib/bridge.js
```

### Server demo page
```
make serve
```