import { IBridgeClient } from './interfaces'

class RPCMethods {
  public static ABCI_QUERY: string = 'abci_query'
  public static BROADCAST_TX_COMMIT: string = 'broadcast_tx_commit'
}

// tslint:disable-next-line:max-classes-per-file
export class Client {
  private uri: string
  private bridge: IBridgeClient

  constructor(uri: string, bridge: IBridgeClient) {
    this.uri = uri
    this.bridge = bridge
  }

  public request = async (method: string, params: object) => {
    const payload = {
      id: 'jsonrpc-client',
      jsonrpc: '2.0',
      method,
      params,
    }
    const resp = await fetch(this.uri, {
      body: JSON.stringify(payload),
      method: 'POST',
    }).then(res => res.json())
    return resp
  }

  public getPubKeyFromPriv = async (privKey: string) => {
    const pubKey = await this.bridge.pubKeyFromPriv(privKey)
    return JSON.parse(pubKey)
  }

  public send = async (from: string, to: string, coins: string, privKey: string) => {
    const signedTx = await this.bridge.sendMessage(from, to, coins, privKey)
    return JSON.parse(signedTx)
  }

  public broadcast = async (signedTx: string) => {
    const resp = await this.request(RPCMethods.BROADCAST_TX_COMMIT, {
      tx: signedTx,
    })
    return resp
  }

  public getAccount = async (address: string) => {
    const resp = await this.request(RPCMethods.ABCI_QUERY, {
      data: address,
      height: '0',
      path: '/store/acc/key',
      trusted: true,
    })
    const accountResp = await this.bridge.decodeAccount(JSON.stringify(resp))
    const account = JSON.parse(accountResp)
    return account
  }
}