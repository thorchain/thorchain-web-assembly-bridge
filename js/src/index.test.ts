import * as fetch from 'node-fetch'
import ThorchainWasmBridge from '.'

declare var global: any

global.crypto = {
    getRandomValues() { return new Uint32Array([4213]) },
}

global.fetch = fetch

it('works', async () => {
    ThorchainWasmBridge({} as any)
})
