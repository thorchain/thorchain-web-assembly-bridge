const THORChainBridge = (function(binaryUri='/bin/bridge.wasm', nodeUri='http://localhost:26657/'){
    function randNum() {
        return crypto.getRandomValues(new Uint32Array(1))[0];
    }

    class WASMBridge {
        constructor() {
            // Used as a prefix for functions added to the global namespace for the bridge
            this.namespace = `_${randNum()}`
            // Holds Go callbacks
            this._client = {}
            // Promise resolves when callbacks are set
            this.ready = new Promise((resolve)=>{
                // Only static use of global namespace needed to share unique namespace.
                // Called after go runs.
                window.__custom_wasm_go_getNamespace = async (callback)=> {
                    // Pass the unique namespace to Go
                    callback(this.namespace)
                    // Get Go callbacks
                    this._requestCallbacks().then(resolve)              
                }
            })
        }

        // Request callbacks from Go
        _requestCallbacks = () => {
            return Promise.all([
                this._requestCallback('sendMessage'),
                this._requestCallback('decodeAccount')
            ])
        }

        _requestCallback = (name) => {
            let resolve
            const promise = new Promise((_resolve)=>{
                resolve = _resolve
            })
            // Export setter function into global namespace to receive Go callback
            window[`${this.namespace}_set_${name}`] = (callback) => {
                this._addClientCallback(callback, name)
                resolve()
            }
            return promise
        }    
    
        // Add client method and setup callbacks for it
        _addClientCallback = (callback, name) => {
            console.log('callback set:', name)
            this._client[name] = (...args) => {
                return new Promise((resolve, reject)=>{
                    const id = randNum();
                    const resolveFn = `resolve_${id}`;
                    const rejectFn = `reject_${id}`;

                    function clean() {
                        delete window[resolveFn]
                        delete window[rejectFn]
                    }

                    // Set callbacks in global namespace for Go response
                    window[resolveFn] = (...args) => {
                        clean()
                        resolve(...args)
                    }
                    window[rejectFn] = (...args) => {
                        clean()
                        reject(...args)
                    }
                    callback(...args, resolveFn) // invoke Go callback
                })
            }
        }

        getClient() {
            return this._client;
        }
    }

    class RPCMethods {
        static ABCI_QUERY = "abci_query"
        static BROADCAST_TX_COMMIT = "broadcast_tx_commit"
    }

    class Client {
        constructor(uri, bridge) {
            this.uri = uri
            this.bridge = bridge
        }
    
        request = async (method, params) => {
            const payload = {
                "jsonrpc": "2.0",
                "id": "jsonrpc-client",
                method,
                params
            }
            const resp = await fetch(this.uri, {
                method: 'POST',
                body: JSON.stringify(payload)
            }).then(resp=>resp.json())
            return resp;
        }
    
        send = async (from, to, coins, privKey) => {
            const signedTx = await this.bridge.sendMessage(from, to, coins, privKey)
            return JSON.parse(signedTx)
        }

        broadcast = async (signedTx) => {
            const resp = await this.request(RPCMethods.BROADCAST_TX_COMMIT, {
                tx: signedTx
            })
            return resp
        }

        getAccount = async (address) => {
            const resp = await this.request(RPCMethods.ABCI_QUERY, {
                data: address,
                height: '0',
                path: '/store/acc/key',
                trusted: true
            })
            const accountResp = await this.bridge.decodeAccount(JSON.stringify(resp))
            const account = JSON.parse(accountResp)
            return account
        }
    }

    class WASMRunner {
        constructor(binaryUri, exec, bridge) {
            this.binaryUri = binaryUri
            this.exec = exec
            this.bridge = bridge
        }

        // Loading in this way doesn't require .wasm files to be served with
        // a special content type.
        async instantiateStreaming(resp, importObject) {
            const source = await (await resp).arrayBuffer();
            return await WebAssembly.instantiate(source, importObject);
        };

        loadBinary = () => {
            return this.instantiateStreaming(fetch(this.binaryUri), this.exec.importObject)
                .then((result) => {
                    this.module = result.module
                    this.instance = result.instance
                });
        }

        run = async () => {
            this.exec.run(this.instance).then(async ()=>{
                // Restart
                this.instance = await WebAssembly.instantiate(this.module, this.exec.importObject); // reset instance
            })
            await this.bridge.ready
        }
    }

    const go = new Go();
    const bridge = new WASMBridge()
    const runner = new WASMRunner(binaryUri, go, bridge)
    const bridgeClient = bridge.getClient()
    const client = new Client(nodeUri, bridgeClient)

    return {
        client,
        runner
    }
})