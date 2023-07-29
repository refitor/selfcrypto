# SelfCrypto

[简体中文][1]

SelfCrypto provides decentralized key management and private dynamic authorization solutions for data encryption and decryption in the form of contract maintenance keys, and supports online text data encryption and decryption services after Google dynamic authorization

## Contract

1. **goerli, 5: 0x9375389f81bBaC6b7c1daC9C5c38F8373c48A301**

2. **opbnb, 5611: 0x49ea1cE733A0e99F990C8840b0f1AD5440B31B05**

2. **mainnet, 1: ~0xec04F8Ee0493f3d763AB1624BB6aAcaCD94Ac4C1~**

## Architecture

![/docs/selfcrypto-en.png](/docs/selfcrypto-en.png)

> 1. **Contract: Responsible for storing web3 key and backend private key, and recovery ID for resetting google dynamic authorization**
> 2. **Wallet: Responsible for interacting with the contract, every time the key data is extracted from the contract, it needs to dynamically generate a signature to be verified by the contract**
> 3. **Dynamic authorization: The dynamic authorization triggered by the front-end is used to ensure that the encryption and decryption must be completed by the front-end and back-end cooperation**
> 4. **Online encryption and decryption: As an online encryption and decryption tool, it supports users to input or import text data for online encryption and decryption**
> 5. **Hybrid encryption and decryption: the front-end part is responsible for encrypting and decrypting plaintext, the back-end part processes ciphertext, key separation and double-layer hybrid encryption ensure high security of plaintext data**
> 6. **Encrypted data hosting: Officially provide ciphertext data hosting in the form of key/value and files, authorized key management, and online visual encryption and decryption services**

## Requirements
> - **1. The private key and mnemonic words of the web3 wallet are frequently lost, and huge amounts of funds are stolen, which poses a huge risk**
> - **2. A large number of centralized software and services require users to manage passwords, which is too cumbersome and insecure**
> - **3. The host security protection measures cannot completely prevent hackers from intruding, and the ciphertext is stored directly, and the plaintext cannot be decrypted at all**

## Features
> - **web3 contract; decentralized storage management hybrid encryption partial key is guaranteed by the contract to prevent tampering**
> - **web2 backend: google dynamic authorization authentication and authorization recovery dynamic verification guarantee must be operated by myself**
> - **Data management: Only hybrid encryption and decryption services are provided as an online tool, and data plaintext and ciphertext are managed by the user**

## Security
> - **web3: The anti-tampering feature of the decentralized environment is supported by the blockchain public chain contract (open source to github)**
> - **web2: only as a dynamic authorization and hybrid encryption and decryption tool, compiled into a wasm binary file and embedded in the web (open source to github)**
> - **Front-end: only as a contract interaction and online encryption and decryption tool, it needs to cooperate with the back-end through google dynamic authorization (open source to github)**
> - **Key: The key is maintained by web3 contract + web2 dynamic calculation to ensure that neither the wallet account nor the backend can obtain the plaintext alone**
> - **Data: The data is kept by the user in the way of web3 + web2 hybrid encryption to ensure that neither the wallet account nor the backend can obtain the plaintext alone**

## Self-Host

> - **install: git, go, npm, yarn**

> - **1. clone: git clone https://github.com/refitor/selfcrypto.git**

> - **2. contract: Deploy by yourself through remix or other tools**

> - **3. website: cd selfcrypto && ./build.sh, the website source code will be automatically built in the selfcrypto directory**

## Notice

> - All official contract addresses are deployed using the open source version source code. All addresses will be updated synchronously in the github document, and the home page will be automatically displayed at the same time. Please make sure that the addresses are consistent

> - Since the backend part needs to be compiled into wasm and embedded in the web, please be sure to use the only online site built with the official open source version: https://refitor.github.io/selfcrypto

> - Cases that require private deployment: The public key that participates in the dynamic calculation of the google authorization key is the user wallet public key by default, and the key will not change after the recovery operation is performed to reset the google authorization. If you need to specify another public key or not If you hope that the google authorization key will not change, you need to specify the public key and private deployment to rebuild

> - **selfCrypto currently supports EIP-712, supported: goerli, opbnb， mainnet: After upgrading to EIP-712, it is no longer available, if you choose private deployment, you can maintain the public key c_public_hex for private deployment: selfcrypto/backend/wasm/user.go** 

## Usage

### Network
The georli test network is only used for encryption and decryption function testing. For official use, please choose the Ethereum main network mainnet

### Register
Registration is used to initialize the current wallet account inside the contract, and the user needs to enter the recovery ID (email)

### Recovery
Recovery is used to reset the backend, you need to enter the received dynamic random verification code

### Encrypt-Decrypt
After the google dynamic authorization is passed, enter the online encryption and decryption page, only the input text data or the uploaded text file is encrypted and decrypted, and the front end and the contract are not stored

[1]: /docs/README-zh.md
