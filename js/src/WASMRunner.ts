import { WASMBridge } from "./WASMBridge";
import {Runtime} from "./interfaces"

export class WASMRunner {
  private binaryUri: string
  private exec: Runtime
  private bridge: WASMBridge
  private module: WebAssembly.Module
  private instance: WebAssembly.Instance
  

  constructor(exec: Runtime, binaryUri: string, bridge: WASMBridge) {
    this.exec = exec
    this.binaryUri = binaryUri
    this.bridge = bridge
  }

  // Loading in this way doesn't require .wasm files to be served with
  // a special content type.
  private async instantiateStreaming(resp: Promise<Response>, importObject: WebAssembly.Imports) {
    const source = await (await resp).arrayBuffer();
    return await WebAssembly.instantiate(source, importObject);
  };

  public loadBinary = () => {
    return this.instantiateStreaming(fetch(this.binaryUri), this.exec.importObject)
      .then((result) => {
        this.module = result.module
        this.instance = result.instance
      });
  }

  public run = async () => {
    this.exec.run(this.instance).then(async ()=>{
      // Restart
      this.instance = await WebAssembly.instantiate(this.module, this.exec.importObject); // reset instance
    })
    await this.bridge.isReady()
  }
}