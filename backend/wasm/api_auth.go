package wasm

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
	"time"

	"selfcrypto/common/rsauth"

	"github.com/ethereum/go-ethereum/crypto"
	"github.com/refitor/rslog"
)

const (
	c_Data_Pass           = "pass"
	c_Data_Reload         = "reload"
	c_Data_Pending        = "pending"
	c_Data_Success        = "successed"
	c_Error_Denied        = "permission denied"
	c_Error_InvalidParams = "invalid request params"
)

type Response struct {
	Data  interface{}
	Error string
}

func wasmResponse(data any, err string) *Response {
	wasmResp := new(Response)
	wasmResp.Data = data
	wasmResp.Error = err
	return wasmResp
}

// @request authID wallet address
// @response backendPublic backend public key
// @response web3Public wallet account public key
func Load(datas ...string) *Response {
	if len(datas) < 3 || datas[0] == "" {
		return wasmResponse(nil, c_Error_InvalidParams)
	}
	authID, web3Public, backendKey := datas[0], datas[1], datas[2]

	// cache backendKey
	_, err := GetAuthUser(authID, web3Public, backendKey)
	if err != nil {
		return wasmResponse(nil, WebError(err, ""))
	}
	return wasmResponse(hex.EncodeToString(crypto.CompressPubkey(vserver.public)), "")
}

// @request authID: wallet address
// @request recoverID: push channel used to recover the backend (email phone number, etc.)
// @response recoverID: recovery ID encrypted by backend key
// @response qrcode: QR code for Google Authenticator scanning to add account
// @response backendKey: encrypted by backend public key
func Register(datas ...string) *Response {
	if len(datas) < 2 || datas[0] == "" || datas[1] == "" {
		return wasmResponse(nil, c_Error_InvalidParams)
	}
	authID, recoverID := datas[0], datas[1]

	// register user
	auser, err := GetAuthUser(authID, "", "")
	if err != nil {
		return wasmResponse(nil, WebError(err, ""))
	}

	// init backendKey and recoverID
	encryptedRecoverID, encryptedBackendKey, err := auser.Init(authID, recoverID, nil)
	if err != nil {
		return wasmResponse(nil, WebError(err, "encrypt backendKey or recoverID failed"))
	}

	retMap := make(map[string]string, 0)
	retMap["recoverID"] = encryptedRecoverID
	retMap["backendKey"] = encryptedBackendKey
	retMap["qrcode"], _ = auser.GetQrcode(authID)
	return wasmResponse(retMap, "")
}

// Post: /api/user/recover
// @request authID: wallet address
// @request pushID: push channel used to recover the backend (email phone number, etc.)
// @response successed or error
func Recover(datas ...string) *Response {
	if len(datas) < 2 || datas[0] == "" || datas[1] == "" {
		return wasmResponse(nil, c_Error_InvalidParams)
	}
	authID, pushID := datas[0], datas[1]

	// send verify code
	code := GetRandom(6, true)
	if err := vserver.SetCacheByTime("recoveryCode-"+authID, code, true, 300, nil); err != nil {
		return wasmResponse(nil, WebError(err, ""))
	}

	// sendCh := make(chan struct{})
	// if _, err := rsauth.PushByEmail(pushID, "dynamic authorization", "", fmt.Sprintf("[SelfCrypto] code for dynamic authorization: %s", code), func(err error) {
	// 	if err != nil {
	// 		rslog.Errorf("email send failed: %s", err.Error())
	// 	}
	// 	close(sendCh)
	// }); err != nil {
	// 	return wasmResponse(nil, WebError(err, ""))
	// }
	// <-sendCh

	// rslog.Debugf("push code to recoverID successed, recoverID: %s, code: %s", pushID, code)
	vserver.SetCache("pushID-"+authID, pushID, true)

	return wasmResponse(code, "")
}

// @request authID: wallet address
// @request code: code input for dynamic authorization
// @request kind: kind need verify for dynamic authorization
// @request params: params need verify for dynamic authorization
// @response for email verify qrcode for dynamic authorization verify
// @response for dynamic authorization content encrypted or decrypted by backend key
func Auth(datas ...string) *Response {
	if len(datas) < 5 || datas[0] == "" || datas[1] == "" || datas[2] == "" || datas[3] == "" || datas[4] == "" {
		return wasmResponse(nil, c_Error_InvalidParams)
	}
	authID, code, kind := datas[0], datas[1], datas[2]
	authParams1, authParams2 := datas[3], datas[4]

	// verify user
	auser, err := GetAuthUser(authID, "", "")
	if err != nil {
		return wasmResponse(nil, WebError(err, ""))
	}
	if auser.SelfPrivate == nil {
		return wasmResponse(nil, WebError(err, c_Data_Reload))
	}

	// verify by google
	var verifyErr error
	var responseData interface{}
	retMap := make(map[string]interface{}, 0)
	switch kind {
	case "google":
		secret, err := auser.getKey(auser.Web3Public, nil)
		if err != nil {
			verifyErr = err
			break
		}
		if ok, err := rsauth.NewGoogleAuth().VerifyCode(secret, code); err != nil {
			verifyErr = err
			break
		} else if !ok {
			verifyErr = errors.New("selfCrypto google verify failed")
			break
		}
		responseData, err = auser.HandleCrypto(authParams1, authParams2)
		if err != nil {
			verifyErr = err
			break
		}
	case "email":
		memCode := vserver.GetCache("recoveryCode-"+authID, false, nil)
		if code != fmt.Sprintf("%v", memCode) {
			verifyErr = errors.New("selfCrypto email verify failed")
			break
		} else {
			vserver.GetCache(authID, true, nil)
		}

		pushID := fmt.Sprintf("%v", vserver.GetCache("pushID-"+authID, true, nil))
		resetUser, err := auser.Reset(authID, pushID, authParams1, authParams2)
		if err != nil {
			return wasmResponse(nil, WebError(err, ""))
		}
		retMap["qrcode"], _ = resetUser.GetQrcode(authID)
		responseData = retMap
	default:
		return wasmResponse(nil, c_Error_InvalidParams)
	}
	if verifyErr != nil {
		return wasmResponse(nil, WebError(verifyErr, "selfCrypto verify failed"))
	}

	return wasmResponse(responseData, "")
}

// ===================================help function=====================================
func GetRandomInt(max *big.Int) (int, error) {
	if max == nil {
		seed := "0123456789"
		alphanum := seed + fmt.Sprintf("%v", time.Now().UnixNano())
		max = big.NewInt(int64(len(alphanum)))
	}
	vrand, err := rand.Int(rand.Reader, max)
	if err != nil {
		return 0, err
	}
	return int(vrand.Int64()), nil
}

func GetRandom(n int, isNO bool) string {
	seed := "0123456789"
	if !isNO {
		seed = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	}
	alphanum := seed + fmt.Sprintf("%v", time.Now().UnixNano())
	buffer := make([]byte, n)
	max := big.NewInt(int64(len(alphanum)))

	for i := 0; i < n; i++ {
		index, err := GetRandomInt(max)
		if err != nil {
			return ""
		}

		buffer[i] = alphanum[index]
	}
	return string(buffer)
}

func WebError(err error, webErr string) string {
	logid := time.Now().UnixNano()
	if webErr == "" {
		webErr = "system processing exception"
	}
	if err != nil {
		rslog.Errorf("%v-%s", logid, err.Error())
	}
	return fmt.Sprintf("%v-%s", logid, webErr)
}
