import {BridgeClient} from './interfaces'
import {UniqueRNG, URNGResult} from './helpers'

export class WASMBridge {
  private namespace: string
  private client: object
  private ready: Promise<void>
  private uRNG: UniqueRNG

  public releaseNamesapce: ()=>void

  constructor() {
    // Used as a prefix for functions added to the global namespace for the bridge
    const result: URNGResult = this.uRNG.getRand()
    this.releaseNamesapce = result.release
    this.namespace = `_${result.number}`
    // Holds WASM callbacks
    this.client = {}
    // Promise resolves when callbacks are set
    this.ready = new Promise((resolve:()=>void)=>{
      // Only static use of global namespace needed to share unique namespace.
      // Called after go runs.
      //@ts-ignore
      window.__thorchain_wasm_go_getNamespace = async (callback: Function)=> {
          // Pass the unique namespace to WASM
          callback(this.namespace)
          // Get WASM callbacks
          this.requestCallbacks().then(resolve)              
      }
    })
  }

  public isReady(): Promise<void> {
    return this.ready
  }

  public getClient(): BridgeClient {
    return this.client as BridgeClient;
  }

  // Request callbacks from WASM
  private requestCallbacks = () => {
    return Promise.all([
      this.requestCallback('sendMessage'),
      this.requestCallback('decodeAccount'),
      this.requestCallback('pubKeyFromPriv'),
    ])
  }

  private requestCallback = (name: string) => {
    let resolve: (...args:any)=>void
    const promise = new Promise((_resolve)=>{
      resolve = _resolve
    })
    // Export setter function into global namespace to receive WASM callback
    window[`${this.namespace}_set_${name}`] = (callback:any) => {
      this.addClientCallback(callback, name)
      resolve()
    }
    return promise
  }    

  // Add client method for WASM callback and setup wrappers for it
  private addClientCallback = (callback: any, name: string) => {
    this.client[name] = (...args:any) => {
      // Promise wrapper to get response from WASM
      return new Promise((resolve, reject)=>{
        const {number: id, release: releaseNumber} = this.uRNG.getRand();
        const resolveFn = `resolve_${id}`;
        const rejectFn = `reject_${id}`;

        function clean() {
          releaseNumber()
          delete window[resolveFn]
          delete window[rejectFn]
        }

        // Set callbacks in global namespace for WASM response
        window[resolveFn] = (...args:any) => {
          clean()
          resolve(...args)
        }
        window[rejectFn] = (...args:any) => {
          clean()
          reject(...args)
        }
        callback(...args, resolveFn) // invoke WASM callback
      })
    }
  }
}