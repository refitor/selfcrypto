package main

import (
	"encoding/json"
	"syscall/js"

	"selfcrypto/wasm"
)

func main() {
	// init
	wasm.Init()
	defer wasm.UnInit()

	js.Global().Set("Auth", js.FuncOf(wrapWasmFunc(wasm.Auth)))
	js.Global().Set("Load", js.FuncOf(wrapWasmFunc(wasm.Load)))
	js.Global().Set("Regist", js.FuncOf(wrapWasmFunc(wasm.Regist)))
	js.Global().Set("Recover", js.FuncOf(wrapWasmFunc(wasm.Recover)))

	select {}
}

func wrapWasmFunc(f func(datas ...string) *wasm.Response) func(this js.Value, args []js.Value) any {
	return func(this js.Value, args []js.Value) any {
		callback := args[len(args)-1]
		go func() {
			requestParams := make([]string, 0)
			for i := 0; i < len(args)-1; i++ {
				requestParams = append(requestParams, args[i].String())
			}
			responseBuf, _ := json.Marshal(f(requestParams...))
			callback.Invoke(string(responseBuf))
		}()
		return nil
	}
}
