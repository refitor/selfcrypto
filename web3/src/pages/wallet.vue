<style scoped>
.nav-header-left {
    font-size: 20px;
    text-align: left;
    margin-top: 15px;
    margin-left: 10px;
}
</style>
<template>
    <div>
        <div style="text-align: right; margin: 10px;">
            <w3m-core-button></w3m-core-button>
        </div>
    </div>
</template>
<script>
import Web3 from "web3";
import { web3chains, ethereumClient, web3Modal } from '../web3modal.js';
export default {
    data() {
        return {
            connected: false,

            web3: null,
            networkId: '',
            contractAddrMap: {
                '5': '0x5e2200656e30d04c936fc0af995E6c51F6EAA96B',
                '5611': '0x304eBa9f694f5a44Ddaa48aa4481Bf08AB0bE09B'
            },
            contractABI: [
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "wallet",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "feeRate",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "constructor"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "previousOwner",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "newOwner",
                            "type": "address"
                        }
                    ],
                    "name": "OwnershipTransferred",
                    "type": "event"
                },
                {
                    "inputs": [
                        {
                            "internalType": "bytes",
                            "name": "signature",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "message",
                            "type": "bytes"
                        }
                    ],
                    "name": "Load",
                    "outputs": [
                        {
                            "internalType": "bytes",
                            "name": "recoverID",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "web3Key",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "backendKey",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "web3PublicKey",
                            "type": "bytes"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "Meta",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "feeRate",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "registTotal",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "bytes",
                            "name": "signature",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "message",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "web3PublicKey",
                            "type": "bytes"
                        }
                    ],
                    "name": "Recover",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "bytes",
                            "name": "recoverID",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "web3Key",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "backendKey",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "web3PublicKey",
                            "type": "bytes"
                        }
                    ],
                    "name": "Register",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "owner",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "renounceOwnership",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "newOwner",
                            "type": "address"
                        }
                    ],
                    "name": "transferOwnership",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ]
        }
    },
    mounted() {
        let self = this;
        ethereumClient.watchAccount(function(account) {
            self.onAccount(account);
        });
        // ethereumClient.watchNetwork(function(network) {
        //     self.onNetwork(network);
        // });
    },
    methods: {
        async onAccount(account) {
            let self = this;
            const walletAddress = account['address'];
            if (account['address'] !== undefined) {
                const provider = account['connector']['options'].getProvider();
                
                const web3 = new Web3(provider);
                const networkId = await web3.eth.net.getId();
                console.log('wallet connect successed: ', networkId, account, web3, provider);
                if (this.contractAddrMap[networkId] === undefined) {
                    this.$Modal.error({
                        title: 'unsupport network',
                        content: 'Currently supported chainId list: ' + Object.keys(this.contractAddrMap),
                    });
                    ethereumClient.disconnect();
                    return;
                }
                this.web3 = web3;
                this.networkId = networkId;
                this.$parent.onAccountChanged('connect', this.networkId, walletAddress);

                // Subscribe to accounts change
                account['connector'].on("change", (eventParam) => {
                    console.log("event change: ", eventParam);
                    self.web3Reload('change');
                });

                // Subscribe to account disconnect
                account['connector'].on("disconnect", (eventParam) => {
                    console.log("event disconnect: ", eventParam);
                    self.web3Reload('disconnect');
                });

                // Subscribe to account disconnect
                account['connector'].on("error", (eventParam) => {
                    console.log("event error: ", eventParam);
                    self.web3Reload('error');
                });
            } else {
                this.web3Reload('disconnect');
            }
        },
        web3Reload(event) {
            this.web3 = null;
            this.networkId = '';
            this.$parent.onAccountChanged(event, this.networkId, '');
        },
        getWeb3() {
            return this.web3;
        },
        async Execute(executeFunc, methodName, walletAddress, msgValue, params, successed, failed) {
            console.log(this.contractAddrMap[this.networkId], this.contractABI, executeFunc, methodName, walletAddress, msgValue, params);
            const myContract = new this.web3.eth.Contract(this.contractABI, this.contractAddrMap[this.networkId]);
            let web3Func = myContract.methods[methodName];

            let self = this;
            let sendObject = {};
            if (params.length === 0) {
                sendObject = web3Func();
            } else {
                sendObject = web3Func(...params);
            }
            if (msgValue !== undefined && msgValue > 0) msgValue = Web3.utils.toBN(Web3.utils.toWei(msgValue + '', 'ether'));

            if (executeFunc === 'call') {
                await sendObject.call({ from: walletAddress }, function (error, result) {
                    if (error) {
                        console.log("Execute failed: ", error['message']);
                        if (failed !== undefined && failed !== null) failed(error['message']);
                    } else {
                        console.log("Execute successed: ", result);
                        if (successed !== undefined && successed !== null) successed(result);
                    }
                })
            } else if (executeFunc === 'send') {
                const gasAmount = await sendObject.estimateGas({ from: walletAddress, value: msgValue });
                console.log('gasLimit', gasAmount);
                await sendObject.send({ from: walletAddress, value: msgValue, gasLimit: gasAmount })
                    .on('transactionHash', function (hash) {
                        console.log('transactionHash:', hash);
                        self.$Message.success('web3Execute run succesed: ', hash);
                    })
                    .on('confirmation', function (confirmationNumber, receipt) {
                    })
                    .on('receipt', function (receipt) {
                        console.log("Execute successed: ", receipt);
                        if (successed !== undefined && successed !== null) successed(receipt);
                    })
                    .on('error', function(error){
                        console.log("Execute failed: ", error);
                        if (failed !== undefined && failed !== null) failed(error['message']);
                    });
            }
        },
    }
}
</script>