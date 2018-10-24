package util

import (
	"encoding/json"
	"fmt"

	"github.com/cosmos/cosmos-sdk/wire"
	"github.com/cosmos/cosmos-sdk/x/auth"
	"github.com/pkg/errors"
	"github.com/thorchain/thorchain-wasm-bridge/types"
)

func GetPublicKey(priv []byte) {
	return
}

func UnmarshalResponseBytes(cdc *wire.Codec, responseBytes []byte, result interface{}) (interface{}, error) {
	var err error
	response := &types.RPCResponse{}
	err = json.Unmarshal(responseBytes, response)
	if err != nil {
		return nil, errors.Errorf("Error unmarshalling rpc response: %v", err)
	}
	fmt.Printf("rpc response: %+v\n", response)
	if response.Error != nil {
		return nil, errors.Errorf("Response error: %v", response.Error)
	}
	// Unmarshal the RawMessage into the result.
	err = cdc.UnmarshalJSON(response.Result, result)
	if err != nil {
		return nil, errors.Errorf("Error unmarshalling rpc response result: %v", err)
	}
	fmt.Printf("result: %+v\n", result)
	return result, nil
}

func DecodeAccount(cdc *wire.Codec, accBytes []byte) (acct auth.BaseAccount, err error) {
	err = cdc.UnmarshalBinaryBare(accBytes, &acct)
	if err != nil {
		panic(err)
	}

	return acct, err
}
