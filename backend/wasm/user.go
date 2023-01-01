package wasm

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/hmac"
	"crypto/sha1"
	"encoding/base32"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"selfcrypto/common/rscrypto"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/crypto/ecies"
	"github.com/refitor/rslog"
)

const (
	c_name_user   = "user"
	c_public_hex  = ""                              // optional: The public key that participates in the google dynamic authorization key generation uses the wallet public key by default. If you need to change it, you can recompile and generate selfcrypto.wasm by specifying the private public key. The format is a hexadecimal string.
	c_backend_pwd = "your password for the backend" // required: The backend password is used to encrypt the backendKey and recoverID stored in the contract, the format is a string of length 32
)

type AuthUser struct {
	ActiveTime  time.Time
	Web3Public  *ecdsa.PublicKey
	SelfPrivate *ecdsa.PrivateKey
}

func GetAuthUser(authID, web3Public, backendKey string) (*AuthUser, error) {
	if user, ok := vserver.GetCache(c_name_user+"-"+authID, false, nil).(*AuthUser); ok {
		user.ActiveTime = time.Now()
		return user, nil
	} else {
		// create user
		user := &AuthUser{ActiveTime: time.Now()}

		// handle for SelfPrivate
		if backendKey != "" {
			selfPrivateKeyBuf, err := hex.DecodeString(backendKey)
			if err != nil {
				return nil, fmt.Errorf("getAuthUser failed at hex.DecodeString, detail: %s", err.Error())
			}
			selfPrivateKey, err := crypto.ToECDSA(rscrypto.AesDecryptECB(selfPrivateKeyBuf, []byte(c_backend_pwd)))
			if err != nil {
				return nil, fmt.Errorf("getAuthUser failed at crypto.ToECDSA, detail: %s", err.Error())
			}
			user.SelfPrivate = selfPrivateKey
		}

		// specify the private public key
		if c_public_hex != "" {
			web3Public = c_public_hex
		}

		// walletPublic: handle for Web3Public
		if web3Public != "" {
			// parse publicKey from hex format
			if !strings.HasPrefix(web3Public, "0x04") {
				web3Public = "0x04" + web3Public
			}
			pubBuf, err := hexutil.Decode(web3Public)
			if err != nil {
				return nil, fmt.Errorf("getAuthUser failed at hexutil.Decode, detail: %s", err.Error())
			}
			// publicKey, err := crypto.DecompressPubkey(pubBuf)
			publicKey, err := crypto.UnmarshalPubkey(pubBuf)
			if err != nil {
				return nil, fmt.Errorf("getAuthUser failed at crypto.UnmarshalPubkey, detail: %s", err.Error())
			}
			user.Web3Public = publicKey
		}
		strPublic := hex.EncodeToString(crypto.CompressPubkey(user.Web3Public))
		rslog.Debugf("register user successed, %s, %s, %+v", web3Public, strPublic, user)

		// save to cache
		vserver.SetCacheByTime(c_name_user+"-"+authID, user, true, 900, func(s string) bool {
			rslog.Infof("before delete user at memory, authID: %s", authID)
			if memUser, ok := vserver.GetCache(s, false, nil).(*AuthUser); ok && memUser != nil && time.Since(memUser.ActiveTime).Seconds() < 900 {
				return false
			} else {
				rslog.Infof("reset timer for user at memory, time-offset: %.2f", time.Since(memUser.ActiveTime).Seconds())
			}
			return true
		})
		return user, nil
	}
}

func (p *AuthUser) Init(authID, recoverID string, privateKey *ecdsa.PrivateKey) (string, string, error) {
	// generate privateKey
	if privateKey == nil {
		registPrivateKey3, err := crypto.GenerateKey()
		if err != nil {
			return "", "", fmt.Errorf("Init failed at crypto.GenerateKey, detail: %s", err.Error())
		}
		p.SelfPrivate = registPrivateKey3
	} else {
		p.SelfPrivate = privateKey
	}
	// privateKey3 := hexutil.Encode(crypto.FromECDSA(p.SelfPrivate))[2:]
	selfPrivate3 := hex.EncodeToString(rscrypto.AesEncryptECB(crypto.FromECDSA(p.SelfPrivate), []byte(c_backend_pwd)))
	// rslog.Debugf("Init generate privateKey successed, selfPrivate3: %s", selfPrivate3)

	// // generate publicKey
	// if publicKey == nil {
	// 	cryptoPrivateKey, err := crypto.GenerateKey()
	// 	if err != nil {
	// 		return "", "", PackError(err)
	// 	}
	// 	p.PublicKey = cryptoPrivateKey.Public().(*ecdsa.PublicKey)
	// } else {
	// 	p.PublicKey = publicKey
	// }

	// // generate backendKey
	// backendKey, sharedErr := p.getKey(p.Web3Public, nil)
	// if sharedErr != nil {
	// 	return "", "", sharedErr
	// }

	// recoverID
	recoverIDBuf := rscrypto.AesEncryptECB([]byte(recoverID), []byte(c_backend_pwd))
	return base32.StdEncoding.EncodeToString(recoverIDBuf), selfPrivate3, nil
}

func (p *AuthUser) Reset(authID, pushID, recoverID string) (*AuthUser, error) {
	// // decrypt recoverID by backendKey and verify pushID
	// backendKey, err := p.getKey(p.Web3Public, nil)
	// if err != nil {
	// 	return nil, err
	// }
	recoverIDBuf, _ := base32.StdEncoding.DecodeString(recoverID)
	decryptedRecoverID := string(rscrypto.AesDecryptECB(recoverIDBuf, []byte(c_backend_pwd)))
	if pushID != decryptedRecoverID {
		return nil, fmt.Errorf("invalid pushID for recovery, pushID: %s, recoverID: %s", pushID, decryptedRecoverID)
	}

	// reset AuthUser
	resetUser := new(AuthUser)
	resetUser.ActiveTime = p.ActiveTime
	resetUser.Web3Public = p.Web3Public
	if _, _, err := resetUser.Init(authID, decryptedRecoverID, p.SelfPrivate); err != nil {
		return nil, err
	}

	// cache for user
	vserver.SetCacheByTime(c_name_user+"-"+authID, resetUser, true, 900, func(s string) bool {
		rslog.Infof("before delete user at memory, authID: %s", authID)
		if memUser, ok := vserver.GetCache(s, false, nil).(*AuthUser); ok && memUser != nil && time.Since(memUser.ActiveTime).Seconds() < 900 {
			return false
		} else {
			rslog.Infof("reset timer for user at memory, time-offset: %.2f", time.Since(memUser.ActiveTime).Seconds())
		}
		return true
	})
	return resetUser, nil
}

func (p *AuthUser) HandleCrypto(action, content string) (ret string, retErr error) {
	if content == "" {
		return "", errors.New("decrypt failed with invalid content")
	}

	switch action {
	case "encrypt":
		// private + public => encrypt key
		key, err := p.getKey(vserver.public, nil)
		if err != nil {
			return "", err
		}
		pubKey, err := p.getKey(p.Web3Public, nil)
		if err != nil {
			return "", err
		}

		// [][]byte to json
		ebuf := make([][]byte, 0)
		ebuf = append(ebuf, rscrypto.AesEncryptECB(crypto.CompressPubkey(vserver.public), []byte(pubKey)))
		ebuf = append(ebuf, rscrypto.AesEncryptECB([]byte(content), []byte(key)))
		ebufJson, err := json.Marshal(ebuf)
		if err != nil {
			return "", fmt.Errorf("encrypt failed at json.Marshal, detail: %s", err.Error())
		}

		// json to hex
		ret = string(hex.EncodeToString(ebufJson))
	case "decrypt":
		// hex to json
		debuf, err := hex.DecodeString(content)
		if err != nil {
			return "", fmt.Errorf("decrypt failed at hex.DecodeString, detail: %s", err.Error())
		}
		pubKey, err := p.getKey(p.Web3Public, nil)
		if err != nil {
			return "", err
		}

		// json to [][]byte
		ebuf := make([][]byte, 0)
		if err := json.Unmarshal(debuf, &ebuf); err != nil {
			return "", fmt.Errorf("decrypt failed at json.Unmarshal, detail: %s", err.Error())
		}
		if len(ebuf) != 2 {
			return "", errors.New("decrypt failed with invalid content")
		}

		// generate key
		vpublic, _ := crypto.DecompressPubkey(rscrypto.AesDecryptECB(ebuf[0], []byte(pubKey)))
		key, err := p.getKey(vpublic, nil)
		if err != nil {
			return "", err
		}
		ret = string(rscrypto.AesDecryptECB(ebuf[1], []byte(key)))
	default:
		ret = content
	}
	// rslog.Debugf("AuthUser HandleCrypto successed, action: %s, content: %s, result: %s", action, content, ret)
	return ret, nil
}

func (p *AuthUser) GetQrcode(authID string) (string, error) {
	return p.getKey(p.Web3Public, nil)
}

func (p *AuthUser) getKey(publicKey *ecdsa.PublicKey, privateKey *ecdsa.PrivateKey) (string, error) {
	if publicKey == nil {
		return "", errors.New("generate key failed with invalid public key")
	}
	if privateKey == nil && p.SelfPrivate == nil {
		return "", errors.New("generate key failed with invalid private key")
	}
	if privateKey == nil {
		privateKey = p.SelfPrivate
	}

	skLen := 32
	prv := ecies.ImportECDSA(privateKey)
	pub := ecies.ImportECDSAPublic(publicKey)
	if prv.PublicKey.Curve != pub.Curve {
		return "", ecies.ErrInvalidCurve
	}
	if skLen > ecies.MaxSharedKeyLength(pub) {
		return "", ecies.ErrSharedKeyTooBig
	}

	x, _ := pub.Curve.ScalarMult(pub.X, pub.Y, prv.D.Bytes())
	if x == nil {
		return "", ecies.ErrSharedKeyIsPointAtInfinity
	}

	sk := make([]byte, skLen)
	skBytes := x.Bytes()
	copy(sk[len(sk)-len(skBytes):], skBytes)

	var buf bytes.Buffer
	binary.Write(&buf, binary.BigEndian, x.Int64())
	return strings.ToUpper(base32.StdEncoding.EncodeToString(p.hmacSha1(buf.Bytes(), nil))), nil
}

func (p *AuthUser) hmacSha1(key, data []byte) []byte {
	h := hmac.New(sha1.New, key)
	if total := len(data); total > 0 {
		h.Write(data)
	}
	return h.Sum(nil)
}
