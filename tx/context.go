package tx

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/wire"
	"github.com/cosmos/cosmos-sdk/x/auth"
	"github.com/pkg/errors"
)

// TxContext implements a transaction context created in SDK modules.
type TxContext struct {
	Codec         *wire.Codec
	AccountNumber int64
	Sequence      int64
	Gas           int64
	ChainID       string
	Memo          string
	Fee           string
}

// Build builds a single message to be signed from a TxContext given a set of
// messages. It returns an error if a fee is supplied but cannot be parsed.
func (ctx TxContext) Build(msgs []sdk.Msg) (auth.StdSignMsg, error) {
	chainID := ctx.ChainID
	if chainID == "" {
		return auth.StdSignMsg{}, errors.Errorf("chain ID required but not specified")
	}

	fee := sdk.Coin{}
	if ctx.Fee != "" {
		parsedFee, err := sdk.ParseCoin(ctx.Fee)
		if err != nil {
			return auth.StdSignMsg{}, err
		}

		fee = parsedFee
	}

	return auth.StdSignMsg{
		ChainID:       ctx.ChainID,
		AccountNumber: ctx.AccountNumber,
		Sequence:      ctx.Sequence,
		Memo:          ctx.Memo,
		Msgs:          msgs,

		// TODO: run simulate to estimate gas?
		Fee: auth.NewStdFee(ctx.Gas, fee),
	}, nil
}
