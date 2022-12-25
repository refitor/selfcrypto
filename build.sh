# !/bin/bash

# build selfcrypto.wasm
cd ./backend
go mod init selfcrypto
go mod tidy
rm ../web/public/selfcrypto.wasm
GOOS=js GOARCH=wasm go build -ldflags="-w -s" -o ../web/public/selfcrypto.wasm
cd ../

# build web
cd ./web
yarn install
yarn run build