import { Client } from './Client'
import { IBridgeClient, IRuntime } from './interfaces'
import { WASMBridge } from './WASMBridge'
import { WASMRunner } from './WASMRunner'

export default function (
  runtime: IRuntime,
  binaryUri: string = '/thorchain_bridge.wasm',
  nodeUri: string = 'http://localhost:26657/',
  ClientClass: typeof Client = Client,
) {
  const bridge: WASMBridge = new WASMBridge()
  const runner: WASMRunner = new WASMRunner(runtime, binaryUri, bridge)
  const bridgeClient: IBridgeClient = bridge.getClient()
  const client: Client = new ClientClass(nodeUri, bridgeClient)

  return {
    client,
    runner,
  }
}
