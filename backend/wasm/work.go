package wasm

import (
	"crypto/ecdsa"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/ethereum/go-ethereum/crypto"
	"github.com/refitor/rslog"
)

// global const
const (
	C_date_time = "2006-01-02 15:04:05"
)

var (
	vserver *Server
)

type Server struct {
	cache   sync.Map
	config  sync.Map
	memvar  sync.Map
	public  *ecdsa.PublicKey
	private *ecdsa.PrivateKey
}

func Init() *Server {
	vserver = newServer()
	rslog.SetLevel("info")
	return vserver
}

func UnInit() {
}

func newServer() *Server {
	s := new(Server)
	private, ecdsaErr := crypto.GenerateKey()
	s.FatalCheck(ecdsaErr)
	s.private = private
	s.public = &private.PublicKey
	return s
}

func (p *Server) SetVar(key string, val interface{}, bForce bool) error {
	if !bForce {
		if _, ok := p.memvar.Load(key); ok {
			return fmt.Errorf("cache data already exists, key: %v", key)
		}
	}
	p.memvar.Store(key, val)
	return nil
}

// delete: beforeDelleteFunc return true
func (p *Server) GetVar(key string, bDelete bool, beforeDelleteFunc func(v interface{}) bool) interface{} {
	val, _ := p.memvar.Load(key)
	if beforeDelleteFunc != nil {
		if beforeDelleteFunc(val) {
			p.memvar.Delete(key)
		}
	} else if bDelete {
		p.memvar.Delete(key)
	}
	return val
}

func (p *Server) SetCache(key string, val interface{}, bForce bool) error {
	if !bForce {
		if _, ok := p.cache.Load(key); ok {
			return fmt.Errorf("cache data already exists, key: %v", key)
		}
	}
	p.cache.Store(key, val)
	return nil
}

func (p *Server) SetCacheByTime(key string, val interface{}, bForce bool, timeout time.Duration, callback func(string) bool) error {
	if !bForce {
		if _, ok := p.cache.Load(key); ok {
			return fmt.Errorf("cache data already exists, key: %v", key)
		}
	}

	p.cache.Store(key, val)

	if timeout > 0 {
		go p.autoClearByTimer(key, timeout, callback)
	}
	return nil
}

// timeUnit: second
func (p *Server) autoClearByTimer(key string, timeout time.Duration, callback func(string) bool) {
	timer := time.NewTimer(timeout * time.Second)
	for {
		select {
		case <-timer.C:
			if callback != nil {
				if callback(key) {
					timer.Stop()
					p.cache.Delete(key)
				} else {
					timer.Reset(timeout * time.Second)
					break
				}
			} else {
				timer.Stop()
				p.cache.Delete(key)
			}
			return
		}
	}
}

// delete: beforeDelleteFunc return true
func (p *Server) GetCache(key string, bDelete bool, beforeDelleteFunc func(v interface{}) bool) interface{} {
	val, _ := p.cache.Load(key)
	if beforeDelleteFunc != nil {
		if beforeDelleteFunc(val) {
			p.cache.Delete(key)
		}
	} else if bDelete {
		p.cache.Delete(key)
	}
	return val
}

func (p *Server) SetConf(key, val string) {
	p.config.Store(key, val)
}

func (p *Server) GetConf(key string) string {
	val, _ := p.config.Load(key)
	return fmt.Sprintf("%v", val)
}

func (p *Server) FatalCheck(err error) {
	if err != nil {
		log.Fatal(err.Error())
	}
}
