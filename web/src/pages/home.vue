<template>
    <div>
        <WalletPanel ref="walletPanel" :onAccountChanged="onAccountChanged" />
        <TOTPPanel v-if="showTOTP" ref="totpPanel" :getSelf="getSelf"/>
        <CryptoPanel v-show="showCryptoPanel && !showTOTP" ref="cryptoPanel" :getSelf="getSelf"/>
        <PrivatePanel v-show="!showCryptoPanel && !showTOTP" ref="privatePanel" :getSelf="getSelf"/>
    </div>
</template>
<script>
import Web3 from "web3";
import TOTPPanel from './totp.vue';
import WalletPanel from './wallet.vue';
import CryptoPanel from './crypto.vue';
import PrivatePanel from './private.vue';
export default {
    components: {
        TOTPPanel,
        WalletPanel,
        CryptoPanel,
        PrivatePanel,
    },
    inject: ["reload"],
    data() {
        return {
            network: '',
            connect: false,
            publicKey: '',
            walletAddress: '',

            showTOTP: false,
            justVerify: false,
            showCryptoPanel: false,

            backendPublic: '',
            afterVerifyFunc: null,

            apiPrefix: '',
            loadRandom: '',
            loadSignature: ''
        }
    },
    methods: {
        getSelf() {
            return this;
        },
        onAccountChanged(action, network, address) {
            let self = this;
            if (action === 'connect') {
                this.network = network;
                this.connect = true;
                this.modelAuthID = address;
                this.walletAddress = address;
                this.loadRandom = this.generatekey(6, false);
                self.sign(Web3.utils.soliditySha3("\x19Ethereum Signed Message:\n32", this.loadRandom), function(sig) {
                    console.log('sign successed: ', sig)
                    self.loadSignature = sig;
                    self.load();
                })
            } else if (action === 'disconnect') {
                this.network = '';
                this.connect = false;
                this.walletAddress = '';
            }
        },
        load() {
            let self = this;
            let initBackend = function(recoverID, backendKey, web3Key) {
                // wasm
                let response = {};
                Load(self.walletAddress, self.getPublic(Web3.utils.soliditySha3("\x19Ethereum Signed Message:\n32", self.loadRandom), self.loadSignature), backendKey, function(wasmResponse) {
                    response['data'] = JSON.parse(wasmResponse);
                // // http
                // self.httpGet('/api/user/load?authID=' + self.walletAddress + '&backendKey=' + backendKey, function(response) {
                    if (response.data['Data'] !== null && response.data['Data'] !== undefined && response.data['Data'] !== {}) {
                        self.backendPublic = response.data['Data'];
                        self.$refs.privatePanel.init(recoverID, web3Key, self.backendPublic);
                    } else {
                        self.$Message.error('selfCrypto load from backend failed: ', + response.data['Data']);
                    }
                });
            }

            var loadParams = [];
            loadParams.push(this.loadSignature);
            loadParams.push(Web3.utils.asciiToHex(this.loadRandom));
            self.$refs.walletPanel.Execute("call", "Load", self.walletAddress, 0, loadParams, function (result) {
                console.log('-------------------------------+==', result)
                self.$refs.privatePanel.hasRegisted = true;
                let web3Key = Web3.utils.hexToAscii(result['web3Key']);
                let recoverID = Web3.utils.hexToAscii(result['recoverID']);
                let backendKey = Web3.utils.hexToAscii(result['backendKey']);
                initBackend(recoverID, backendKey, web3Key);
            }, function (err) {
                self.$Message.error('selfCrypto load from contract failed');
                initBackend('', '', '');
            });
        },
        getWalletAddress() {
            return this.walletAddress;
        },
        getWallet() {
            return this.$refs.walletPanel;
        },
        switchPanel(action, cryptoContent, afterVerifyFunc) {
            if (action === 'back' || action === '') {
                this.showCryptoPanel = false;
                // this.reload();
                return;
            }
            this.afterVerifyFunc = afterVerifyFunc;

            let self = this;
            this.showTOTP = true;
            this.$nextTick(function(){
                self.$refs.totpPanel.init(action, self.backendPublic, cryptoContent);
            });
        },
        afterVerify(hasVerified, cryptoContent) {
            this.showTOTP = false;
            if (hasVerified === true) {
                if (this.afterVerifyFunc !== null && this.afterVerifyFunc !== undefined) {
                    this.afterVerifyFunc(cryptoContent);
                    return;
                }
                this.showCryptoPanel = !this.showCryptoPanel;
                this.$refs.cryptoPanel.init(cryptoContent);
            }
        },
        sign(msg, callback) {
            let self = this;
            let walletAddress = this.getWalletAddress();
            this.$refs.walletPanel.getWeb3().eth.sign(msg, walletAddress).then(function(signature) {
                if (callback !== null && callback !== undefined) callback(signature);
            })
            .catch(function(error) {
                self.$Message.error('sign message failed at web3: ', msg, error);
                console.log('sign message failed at web3: ', msg, error)
            })
        },
        getPublic(msgHash, signature) {
            signature = signature.split('x')[1];
            var r = new Buffer(signature.substring(0, 64), 'hex')
            var s = new Buffer(signature.substring(64, 128), 'hex')
            var v = new Buffer((parseInt(signature.substring(128, 130)) + 27).toString());

            var utils = require('ethereumjs-util');
            var pub = utils.ecrecover(Web3.utils.hexToBytes(msgHash), v, r, s).toString('hex');
            console.log(pub);
            return pub;
        },
        generatekey(num, needNO) {
            let library = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            if (needNO === true) library = "0123456789";
            let key = "";
            for (var i = 0; i < num; i++) {
                let randomPoz = Math.floor(Math.random() * library.length);
                key += library.substring(randomPoz, randomPoz + 1);
            }
            return key;
        },
        httpGet(url, onResponse, onPanic) {
            this.$axios.get(this.apiPrefix + url)
                .then(function(response) {
                    if (onResponse !== undefined && onResponse !== null) onResponse(response);
                })
                .catch(function(e) {
                    console.log(e);
                });
        },
        httpPost(url, formdata, onResponse, onPanic) {
            this.$axios.post(this.apiPrefix + url, formdata)
                .then(function(response) {
                    if (onResponse !== undefined && onResponse !== null) onResponse(response);
                })
                .catch(function(e) {
                    console.log(e);
                });
        }
    }
}
</script>