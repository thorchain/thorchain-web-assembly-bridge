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

// Bridge provides access to encoding, encryption, and types to remote Javascript
type Bridge struct {
	cdc       *wire.Codec
	namespace string
	callbacks []js.Callback
}

// NewBridge returns a new instance of Bridge
func NewBridge(cdc *wire.Codec) *Bridge {
	return &Bridge{
		cdc: cdc,
	}
}

// SetNamespace stores a shared namespace with the client used for callbacks
func (b *Bridge) SetNamespace(args []js.Value) {
	b.namespace = args[0].String()
	b.setCallbacks()
}

func (b *Bridge) setCallbacks() {
	callbackSendMessage := js.NewCallback(b.sendMessage)
	setSendMessage := js.Global().Get(b.namespace + "_set_sendMessage")
	setSendMessage.Invoke(callbackSendMessage)

	callbackDecodeAcct := js.NewCallback(b.decodeAccount)
	setDecodeAccount := js.Global().Get(b.namespace + "_set_decodeAccount")
	setDecodeAccount.Invoke(callbackDecodeAcct)

	callbackPubKeyFromPriv := js.NewCallback(b.pubKeyFromPriv)
	setPubKeyFromPriv := js.Global().Get(b.namespace + "_set_pubKeyFromPriv")
	setPubKeyFromPriv.Invoke(callbackPubKeyFromPriv)

	b.callbacks = []js.Callback{
		callbackSendMessage,
		callbackDecodeAcct,
		callbackPubKeyFromPriv,
	}
}

func (b *Bridge) getJSCallback(args []js.Value) js.Value {
	callback := args[len(args)-1:][0]
	fmt.Printf("callback: %v\n", callback)
	jsCallback := js.Global().Get(callback.String())
	return jsCallback
}

// ReleaseCallbacks releases all callbacks created by the bridge from memory
func (b *Bridge) ReleaseCallbacks() {
	for _, callback := range b.callbacks {
		callback.Release()
	}
}

func (b *Bridge) pubKeyFromPriv(args []js.Value) {
	privKey := args[0].String()
	pubKey := util.PubKeyFromPriv(privKey)

	jsonValue, err := b.cdc.MarshalJSON(&pubKey)
	fmt.Printf("jsonValue: %+v\n", jsonValue)
	if err != nil {
		panic(fmt.Sprintf("Unable to get private key: %+v\n", err))
	}
	jsCallback := b.getJSCallback(args)
	jsCallback.Invoke(string(jsonValue))
	return
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
	fmt.Printf("jsonValue: %+v\n", jsonValue)
	jsCallback := b.getJSCallback(args)
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
	jsCallback := b.getJSCallback(args)
	jsCallback.Invoke(string(jsonValue))
}
