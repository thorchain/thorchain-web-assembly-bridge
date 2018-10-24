package bridge

import (
	"encoding/json"
	"fmt"
	"syscall/js"

	"github.com/cosmos/cosmos-sdk/wire"
	"github.com/thorchain/thorchain-wasm-bridge/tx"
	"github.com/thorchain/thorchain-wasm-bridge/tx/util"
	"github.com/thorchain/thorchain-wasm-bridge/types"
)

type Bridge struct {
	cdc       *wire.Codec
	namespace string
	callbacks []js.Callback
}

func NewBridge(cdc *wire.Codec) *Bridge {
	return &Bridge{
		cdc: cdc,
	}
}

func (b *Bridge) SetNamespace(args []js.Value) {
	b.namespace = args[0].String()
	b.setCallbacks()
}

func (b *Bridge) setCallbacks() {
	callbacksendMessage := js.NewCallback(b.sendMessage)
	setSendMessage := js.Global().Get(b.namespace + "_set_sendMessage")
	setSendMessage.Invoke(callbacksendMessage)

	callbackDecodeAcct := js.NewCallback(b.decodeAccount)
	setDecodeAccount := js.Global().Get(b.namespace + "_set_decodeAccount")
	setDecodeAccount.Invoke(callbackDecodeAcct)

	b.callbacks = []js.Callback{
		callbacksendMessage,
		callbackDecodeAcct,
	}
}

func (b *Bridge) ReleaseCallbacks() {
	for _, callback := range b.callbacks {
		callback.Release()
	}
}

func (b *Bridge) decodeAccount(args []js.Value) {
	strValue := args[0].String()
	respBytes := json.RawMessage(strValue)
	fmt.Printf("strValue: %+v\n, respBytes: %+v\n", strValue, respBytes)
	resp := &types.ResultABCIQuery{}
	util.UnmarshalResponseBytes(b.cdc, respBytes, resp)
	fmt.Printf("resp.Value: %+v\n", resp.Response.Value)
	acc, err := util.DecodeAccount(b.cdc, resp.Response.Value)
	fmt.Printf("account: %+v\n", acc)
	// jsonValue, err := b.cdc.MarshalJSON(acctBytes)
	if err != nil {
		panic(err)
	}
	jsonValue, err := b.cdc.MarshalJSON(acc)
	fmt.Print("jsonValue: +%v\n", jsonValue)
	callback := args[len(args)-1:][0]
	jsCallback := js.Global().Get(callback.String())
	jsCallback.Invoke(string(jsonValue))
}

func (b *Bridge) sendMessage(args []js.Value) {
	fmt.Printf("args: %+v", args)
	from := args[0].String()
	to := args[1].String()
	coins := args[2].String()
	privKeyHex := args[3].String()
	txBytes, _ := tx.NewSendTx(from, to, coins, privKeyHex, b.cdc)
	jsonValue, _ := b.cdc.MarshalJSON(txBytes)
	fmt.Printf("jsonValue: %+v\n", string(jsonValue))
	callback := args[len(args)-1:][0]
	jsCallback := js.Global().Get(callback.String())
	jsCallback.Invoke(string(jsonValue))
}
