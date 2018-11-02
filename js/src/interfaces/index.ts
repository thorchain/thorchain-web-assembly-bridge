// BrigeClient contains methods that will be exposed from wasm
export interface BridgeClient {
  sendMessage(from: string, to: string, coins: string, privKey: string): Promise<string>
  decodeAccount(address: string): Promise<string>
  pubKeyFromPriv(privateKey: string): Promise<string>
}

export interface Runtime {
  importObject: WebAssembly.Imports
  run(instance: WebAssembly.Instance): Promise<any>
}