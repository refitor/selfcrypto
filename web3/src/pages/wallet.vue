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
                '5': '0x8eD8bC11E8c2EB21Eb8C1507CD7F60B01cAD8f1E',
                '5611': '0x065b48c674DF3CeD9cF0245Ede3aaF1641f93A65'
            },
            contractABI: [
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
                        }
                    ],
                    "stateMutability": "view",
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
                        }
                    ],
                    "name": "Register",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "Meta",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "storeFee",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "nftAddr",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "registTotal",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
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
        ethereumClient.watchNetwork(function(network) {
            self.onNetwork(network);
        });
    },
    methods: {
        async onAccount(account) {
            const walletAddress = account['address'];
            if (account['address'] !== undefined) {
                const provider = account['connector']['options'].getProvider();
                console.log('wallet connect successed: ', account, provider);
                
                const web3 = new Web3(provider);
                const networkId = await web3.eth.net.getId();
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
                provider.on("accountsChanged", (accounts) => {
                    console.log("accountsChanged: ", accounts);
                    this.web3Reload();
                });

                // Subscribe to chainId change
                provider.on("chainChanged", (chainId) => {
                    console.log("chainChanged: ", chainId);
                    this.web3Reload();
                });

                // Subscribe to provider disconnection
                provider.on("disconnect", (error) => {
                    console.log("disconnect", error);
                    this.web3Reload();
                });
            } else {
                this.web3 = null;
                this.networkId = '';
                this.$parent.onAccountChanged('disconnect', this.networkId, '');
            }
        },
        async onNetwork(network) {
            console.log('wallet.onNetwork: ', network);
            if (network !== this.networkId && this.networkId !== '') {
                this.web3 = null;
                this.networkId = '';
                this.$parent.onAccountChanged('disconnect', this.networkId, '');
            }
        },
        web3Reload() {
            this.web3 = null;
            this.networkId = '';
            this.$parent.onAccountChanged('switch', this.networkId, '');
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