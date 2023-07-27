<template>
    <div>
        <WalletPanel ref="walletPanel" :onAccountChanged="onAccountChanged" />
        <TOTPPanel v-if="showTOTP" ref="totpPanel" :getSelf="getSelf"/>
        <PrivatePanel v-show="showHomePanel && !showTOTP" ref="privatePanel" :getSelf="getSelf"/>
    </div>
</template>
<script>
import Web3 from "web3";
import TOTPPanel from './totp.vue';
import PrivatePanel from './home.vue';
import WalletPanel from './wallet.vue';
export default {
    components: {
        TOTPPanel,
        WalletPanel,
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
            showHomePanel: true,
            showPanels: {},

            panelName: '',
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
        init() {
            let self = this;
            const go = new Go();
            WebAssembly.instantiateStreaming(fetch("selfcrypto.wasm"), go.importObject)
            .then(function(result) {
                console.log('load wasm successed: ', result)
                go.run(result.instance);
                self.loadRandom = self.generatekey(32, false);
                // self.sign(Web3.utils.soliditySha3("\x19Ethereum Signed Message:\n32", self.loadRandom), function(sig) {
                self.signTypedData(self.loadRandom, function(sig) {
                    console.log('sign successed: ', sig)
                    self.loadSignature = sig;
                    self.load();
                })
            })
        },
        onAccountChanged(action, network, address) {
            let self = this;
            if (action === 'connect') {
                this.network = network;
                this.connect = true;
                this.modelAuthID = address;
                this.walletAddress = address;
                this.init();
                // this.loadRandom = this.generatekey(6, false);
                // self.sign(Web3.utils.soliditySha3("\x19Ethereum Signed Message:\n32", this.loadRandom), function(sig) {
                //     console.log('sign successed: ', sig)
                //     self.loadSignature = sig;
                //     self.load();
                // })
            } else if (action === 'disconnect') {
                this.network = '';
                this.connect = false;
                this.walletAddress = '';
            } else {
                window.location.reload();
            }
        },
        load() {
            let self = this;
            let initBackend = function(recoverID, backendKey, web3Key) {
                // wasm
                let response = {};
                Load(self.walletAddress, self.getPublic(self.loadRandom, self.loadSignature), backendKey, function(wasmResponse) {
                    response['data'] = JSON.parse(wasmResponse);
                // // http
                // self.httpGet('/api/user/load?authID=' + self.walletAddress + '&backendKey=' + backendKey, function(response) {
                    if (response.data['Data'] !== null && response.data['Data'] !== undefined && response.data['Data'] !== {}) {
                        self.backendPublic = response.data['Data'];
                        self.$refs.privatePanel.init(recoverID, web3Key, self.backendPublic);
                    } else {
                        self.$Message.error('selfcrypto load from backend failed: ', + response.data['Data']);
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
        switchPanel(action, panelName, panelInitParam, afterVerifyFunc) {
            if (action === 'back' || action === '') {
                this.showPanels[panelName] = false;
                this.showHomePanel = !this.showHomePanel;
                // this.reload();
                return;
            }
            this.panelName = panelName;
            this.afterVerifyFunc = afterVerifyFunc;

            let self = this;
            this.showTOTP = true;
            this.$nextTick(function(){
                self.$refs.totpPanel.init(action, self.backendPublic, panelInitParam);
            });
        },
        afterVerify(hasVerified, panelInitParam) {
            this.showTOTP = false;
            if (hasVerified === true) {
                if (this.afterVerifyFunc !== null && this.afterVerifyFunc !== undefined) {
                    this.afterVerifyFunc(panelInitParam);
                    return;
                }
                this.showHomePanel = !this.showHomePanel;
                this.showPanels[this.panelName] = true;
                this.$refs[this.panelName].init(panelInitParam);
            }
        },
        signTypedData(msg, callback) {
            var msgParams = [
                {
                    type: 'string',
                    name: 'Message',
                    value: msg
                }
            ]
            
            let self = this;
            let from = this.getWalletAddress();
            var params = [msgParams, from];
            var method = 'eth_signTypedData';
            this.$refs.walletPanel.getWeb3().currentProvider.sendAsync({
                method,
                params,
                from,
            }, function (err, result) {
                if (err || result.error) {
                    self.$Message.error('sign message failed at web3: ', msg, error);
                    console.log('sign message failed at web3: ', msg, error)
                    return
                }
                if (callback !== null && callback !== undefined) callback(result.result);
            })
        },
        getPublic(msg, signature) {
            return '0x042791d640dc87f1bf43075f6f205ffb5045adebcbd73b9942cf0a65f8970bbe80d7ffe21f66ea200636d54e927591766d9f53a785e40ef01ae9200332e15b651a';
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