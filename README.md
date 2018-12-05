# thorchain-wasm-bridge

[![Maintainability](https://api.codeclimate.com/v1/badges/9d2cf138e255b1e3ae4c/maintainability)](https://codeclimate.com/github/thorchain/thorchain-wasm-bridge/maintainability)

Bridge for building, signing and encoding tendermint messages in the browser

### Build the web assembly binary

```sh
$ make prepare
$ make build
// stored in ./js/dist/thorchain_bridge.wasm
```

### Build and publish the JavaScript library

See `./js/README.md`

### Working example

See `./example/README.md`

### Cross Langauge Communication

Go code can be invoked through Javascript and vice-versa through the use of registered callbacks. These callbacks can't return values to each other, so we created a wrapper that makes a promise resolving function accesbile to Go and automatically passes it in as the last argument. This allows you to get the result of a Go callback using a promise chain or `await`.
