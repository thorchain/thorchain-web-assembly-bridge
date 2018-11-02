package tx

import (
	"github.com/cosmos/cosmos-sdk/x/auth"
	tmcrypto "github.com/tendermint/tendermint/crypto"
)

//Sign a transaction with a given private key
func privSign(txCtx TxContext, priv tmcrypto.PrivKey, msg auth.StdSignMsg) ([]byte, error) {
	sig, err := priv.Sign(msg.Bytes())
	if err != nil {
		return nil, err
	}
	pubkey := priv.PubKey()

	sigs := []auth.StdSignature{{
		AccountNumber: msg.AccountNumber,
		Sequence:      msg.Sequence,
		PubKey:        pubkey,
		Signature:     sig,
	}}

	return txCtx.Codec.MarshalBinary(auth.NewStdTx(msg.Msgs, msg.Fee, sigs, msg.Memo))
}
