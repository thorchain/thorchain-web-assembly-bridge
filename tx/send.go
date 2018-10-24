package tx

import (
	"encoding/hex"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/wire"
	bankclient "github.com/cosmos/cosmos-sdk/x/bank/client"
	cryptoAmino "github.com/tendermint/tendermint/crypto/encoding/amino"
)

// NewSendTx will create a send tx and sign it with the given key.
func NewSendTx(fromStr string, toStr string, coinsStr string, privKeyHex string, cdc *wire.Codec) ([]byte, error) {
	// build and sign the transaction, then broadcast to Tendermint
	from := sdk.AccAddress([]byte(fromStr))
	to := sdk.AccAddress([]byte(toStr))
	coins, err := sdk.ParseCoins(coinsStr)
	msg := bankclient.BuildMsg(from, to, coins)
	// fmt.Printf("msg: %+v\n", msg)

	txCtx := TxContext{
		Codec:         cdc,
		AccountNumber: 0,
		Sequence:      0,
		ChainID:       "test-chain-local",
		Gas:           1,
	}

	stdSignMsg, err := txCtx.Build([]sdk.Msg{msg})
	// fmt.Printf("stdSignMsg: %+v\n", stdSignMsg)

	privKey, _ := hex.DecodeString(privKeyHex)
	priv, _ := cryptoAmino.PrivKeyFromBytes(privKey)
	// fmt.Printf("privKey: %+v\n", priv)

	txBytes, err := privSign(txCtx, priv, stdSignMsg)
	// fmt.Printf("privSign --> txBytes: %+v, err: %v\n", txBytes, err)

	// fmt.Printf("Transaction txBytes: %+v\n", hex.EncodeToString(txBytes))
	return txBytes, err
}
