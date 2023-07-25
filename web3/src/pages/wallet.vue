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
            network: '',
            connected: false,

            web3: null,

            contractAddrMap: {
                'goerli': '0x8eD8bC11E8c2EB21Eb8C1507CD7F60B01cAD8f1E',
                'mainnet': '0xec04F8Ee0493f3d763AB1624BB6aAcaCD94Ac4C1'
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
            this.walletAddress = account['address'];
            if (account['address'] === undefined) {
                this.web3 = null;
                this.$parent.onAccountChanged('disconnect', this.network, '');
                return
            }
            const provider = account['connector']['options'].getProvider();
            console.log('wallet connect successed, account: ', account, provider);

            this.web3 = new Web3(provider);
            this.network = await this.web3.eth.net.getNetworkType();
            if (this.network === 'main') this.network = 'mainnet';
            if (this.network === 'private') {
                this.$Modal.error({
                    title: 'unsupport network',
                    content: 'Currently supported chain list: ' + web3chains,
                });
                return;
            }
            this.$parent.onAccountChanged('connect', this.network, this.walletAddress);
        },
        async onNetwork(network) {
            console.log('wallet.vue: ', network)
        },
        getWeb3() {
            return this.web3;
        },
        async Execute(executeFunc, methodName, walletAddress, msgValue, params, successed, failed) {
            console.log(this.contractAddrMap[this.network], this.contractABI, executeFunc, methodName, walletAddress, msgValue, params);
            const myContract = new this.web3.eth.Contract(this.contractABI, this.contractAddrMap[this.network]);
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