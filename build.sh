# !/bin/bash

# build selfcrypto.wasm
cd ./backend
go mod init selfcrypto
go mod tidy
rm ../web3/public/selfcrypto.wasm
GOOS=js GOARCH=wasm go build -ldflags="-w -s" -o ../web3/public/selfcrypto.wasm
cd ../

# build web
cd ./web3
yarn install
yarn run build
cd ../