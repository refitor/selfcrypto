#SelfCrypto

[简体中文][1]

SelfCrypto provides decentralized key management and private dynamic authorization solutions for data encryption and decryption in the form of contract maintenance keys, and supports online text data encryption and decryption services after Google dynamic authorization

## Contract

1. **goerli: 0x2c9C0c09568c4A29fc9eE934BF9671655b8a359D**

2. **mainnet: coming soon......**

## Architecture

![/docs/selfcrypto-en.jpg](/docs/selfcrypto-en.png)

> 1. **Contract: Responsible for storing web3 key and backend private key, and recovery ID for resetting google dynamic authorization**
> 2. **Wallet: Responsible for interacting with the contract, every time the key data is extracted from the contract, it needs to dynamically generate a signature to be verified by the contract**
> 3. **Dynamic authorization: The dynamic authorization triggered by the front-end is used to ensure that the encryption and decryption must be completed by the front-end and back-end cooperation**
> 4. **Online encryption and decryption: As an online encryption and decryption tool, it supports users to input or import text data for online encryption and decryption**
> 5. **Hybrid encryption and decryption: the front-end part is responsible for encrypting and decrypting plaintext, the back-end part processes ciphertext, key separation and double-layer hybrid encryption ensure high security of plaintext data**
> 5. **Encrypted data hosting: Officially provide ciphertext data hosting in the form of key/value and files, authorized key management, and online visual encryption and decryption services**

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

## Usage

### 1. Regist
Registration is used to initialize the current wallet account inside the contract, requiring the user to enter the recovery ID

### 2. Recover
Recovery is used to reset the backend, you need to enter the encrypted ciphertext received by recoverID

### 3. Encrypt-Decrypt
After the google dynamic authorization is passed, enter the online encryption and decryption page, only encrypt and decrypt the input text data or uploaded text files, and neither the front end nor the contract are stored

[1]: /docs/README-zh.md
