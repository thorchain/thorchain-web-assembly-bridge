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


### Cross Langauge Communication

Go code can be invoked through Javascript and vice-versa through the use of registered callbacks. These callbacks can't return values to each other, so we created a wrapper that makes a promise resolving function accesbile to Go and automatically passes it in as the last argument. This allows you to get the result of a Go callback using a promise chain or `await`.

### Usage

```
const { client, runner } = THORChainBridge()
const account = await client.getAccount(address)
```

### Serve demo page
```
make serve
```