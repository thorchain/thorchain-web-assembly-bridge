import { IURNGResult, UniqueRNG } from './helpers'
import { IBridgeClient } from './interfaces'

export class WASMBridge {
  public releaseNamesapce: () => void
  private namespace: string
  private client: object
  private ready: Promise<void>
  private uRNG = new UniqueRNG()

  constructor() {
    // Used as a prefix for functions added to the global namespace for the bridge
    const result: IURNGResult = this.uRNG.getRand()
    this.releaseNamesapce = result.release
    this.namespace = `_${result.num}`
    // Holds WASM callbacks
    this.client = {}
    // Promise resolves when callbacks are set
    this.ready = new Promise((resolve: () => void) => {
      // Only static use of global namespace needed to share unique namespace.
      // Called after go runs.
      // @ts-ignore
      window.__thorchain_wasm_go_getNamespace = async (callback: (namespace: string) => void) => {
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

  public getClient(): IBridgeClient {
    return this.client as IBridgeClient
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
    let resolver: (...args: any) => void
    const promise = new Promise((resolve) => {
      resolver = resolve
    })
    // Export setter function into global namespace to receive WASM callback
    window[`${this.namespace}_set_${name}`] = (callback: any) => {
      this.addClientCallback(callback, name)
      resolver()
    }
    return promise
  }

  // Add client method for WASM callback and setup wrappers for it
  private addClientCallback = (callback: any, name: string) => {
    this.client[name] = (...args: any) => {
      // Promise wrapper to get response from WASM
      return new Promise((resolve, reject) => {
        const { num: id, release: releaseNumber } = this.uRNG.getRand()
        const resolveFn = `resolve_${id}`
        const rejectFn = `reject_${id}`

        function clean() {
          releaseNumber()
          delete window[resolveFn]
          delete window[rejectFn]
        }

        // Set callbacks in global namespace for WASM response
        window[resolveFn] = (...innerArgs: any) => {
          clean()
          resolve(...innerArgs)
        }
        window[rejectFn] = (...innerArgs: any) => {
          clean()
          reject(...innerArgs)
        }
        callback(...args, resolveFn) // invoke WASM callback
      })
    }
  }
}