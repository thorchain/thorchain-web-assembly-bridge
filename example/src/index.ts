import ThorchainWasmBridge from 'thorchain-wasm-bridge-2'

declare var Go: any

async function main () {
    const { client, runner } = ThorchainWasmBridge(new Go())

    // tslint:disable-next-line:no-console
    console.log('loading web assembly binary...')

    await runner.loadBinary()

    // tslint:disable-next-line:no-console
    console.log('binary loaded')

    await runner.run()

    // tslint:disable-next-line:no-console
    console.log('bridge ready')

    // test data
    const from = '0117C8E80DB31A2F594E17943CC636AE90B21C92'
    const to = '0117C8E80DB31A2F594E17943CC636AE90B21C92'
    const privKey = 'e1b0f79b20c07da0abbc50e486a1b88736b64756a5e131f1b0f85eb05740b28313dba06bb7'
    const coins = '5RUNE'
    const address = '6163636F756E743A0117C8E80DB31A2F594E17943CC636AE90B21C92'
    // window.pk = "eb5ae98721033cb50e53daf17ca94b4a264e3333448dbd3af6d8379419976437e9e39463f0a2"
    const account = await client.getAccount(address)
    const signedTx = await client.send(from, to, coins, privKey)
    const resp = await client.broadcast(signedTx)

    const pubKey = await client.getPubKeyFromPriv(privKey)

    // tslint:disable-next-line:no-console
    console.log({ account, signedTx, resp, pubKey })
}

main()