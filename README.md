# thorchain-wasm-bridge

[![Maintainability](https://api.codeclimate.com/v1/badges/9d2cf138e255b1e3ae4c/maintainability)](https://codeclimate.com/github/thorchain/thorchain-wasm-bridge/maintainability)

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