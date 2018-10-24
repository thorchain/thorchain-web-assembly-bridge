package main

import (
	"fmt"
	"syscall/js"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/wire"
	"github.com/cosmos/cosmos-sdk/x/auth"
	"github.com/cosmos/cosmos-sdk/x/bank"
	"github.com/thorchain/thorchain-wasm-bridge/bridge"
	"github.com/thorchain/thorchain-wasm-bridge/thorchain/x/clp"
)

var beforeUnloadCh = make(chan struct{})
var namespace string

func main() {
	cdc := MakeCodec()
	b := bridge.NewBridge(cdc)
	defer b.ReleaseCallbacks()

	callbackSetNamespace := js.NewCallback(b.SetNamespace)
	defer callbackSetNamespace.Release()
	setNamespace := js.Global().Get("__custom_wasm_go_getNamespace")
	setNamespace.Invoke(callbackSetNamespace)

	beforeUnloadCb := js.NewEventCallback(0, beforeUnload)
	defer beforeUnloadCb.Release()
	addEventListener := js.Global().Get("addEventListener")
	addEventListener.Invoke("beforeunload", beforeUnloadCb)

	<-beforeUnloadCh
	fmt.Println("bye :-)")
}

// Custom tx codec
func MakeCodec() *wire.Codec {
	var cdc = wire.NewCodec()
	bank.RegisterWire(cdc)
	auth.RegisterWire(cdc)
	clp.RegisterWire(cdc)
	sdk.RegisterWire(cdc)
	wire.RegisterCrypto(cdc)
	return cdc
}

func beforeUnload(event js.Value) {
	beforeUnloadCh <- struct{}{}
}
