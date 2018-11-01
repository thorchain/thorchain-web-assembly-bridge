import {WASMBridge} from './WASMBridge'
import {WASMRunner} from './WASMRunner'
import {Client} from './Client'
import {BridgeClient, Runtime} from './interfaces'

export default function (
  binaryUri: string = '/bin/bridge.wasm',
  nodeUri: string = 'http://localhost:26657/',
  runtime:Runtime,
  ClientClass: typeof Client
) {
  const bridge: WASMBridge = new WASMBridge()
  const runner: WASMRunner = new WASMRunner(runtime, binaryUri, bridge)
  const bridgeClient: BridgeClient = bridge.getClient()
  const client: Client = new ClientClass(nodeUri, bridgeClient)

  return {
    client,
    runner
  }
}