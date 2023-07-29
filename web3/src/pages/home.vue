<style scoped>
.layout {
    /* border: 1px solid #d7dde4; */
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    width: 100%;
    text-align: center;
}

.layout-content-center {
    display: inline-block;

    margin-top: 3%;

    max-width: 60%;
}
</style>
<template>
    <div>
        <div class="layout">
            <div class="layout-content-center">
                <div>
                    <div style="margin: 10px;">
                        <h2 style="margin-bottom: 3px;">SelfCrypto</h2>
                        <Button :disabled="hasRegisted" @click="modalMode = 'register'; popModal = true" type="primary" style="margin: 10px;">Regist</Button>
                        <Button :disabled ="!hasRegisted" @click="beforeRecover()" type="primary" style="margin: 10px;">Recover</Button>
                        <!-- <Button :disabled ="!hasRegisted || web3Key === ''" @click="logout()" type="primary" style="margin: 10px;">Logout</Button> -->
                        <Button @click="executeAction('cryptoPanel', '')" type="primary" style="margin: 10px;">Encrypt-Decrypt</Button>
                        <!-- <Button :disabled ="!hasRegisted || web3Key === ''" @click="executeAction('cryptoPanel', '')" type="primary" style="margin: 10px;">Encrypt-Decrypt</Button> -->
                        <Table border style="margin-top: 8px;" no-data-text="empty key/value list" :columns="items.columns" :data="items.data"></Table>
                    </div>
                    <VueQrcode v-if="qrcodeUrl !== ''" :value="qrcodeUrl" :options="{ width: 150 }" />
                    <h3 v-if="qrcodeUrl !== ''" style="text-align: center;">Please add an account through Google Authenticator within 1 minutes.</h3>
                </div>
            </div>
        </div>
        <Modal
            v-model="popModal"
            :footer-hide="hideFooter"
            class-name="vertical-center-modal">
            <p style="text-align: center;margin-bottom: 10px;">{{placeHolderMap[modalMode].title}}</p>
            <Input v-model="modelKey" type="email" :placeholder="placeHolderMap[modalMode].placeholder"><span slot="prepend">{{placeHolderMap[modalMode].name}}</span></Input>
            <!--Input v-if="modalMode === 'verify'" v-model="modelValue" type="text"><span slot="prepend" style="margin-top: 10px;">Value</span></Input-->
            <div style="text-align: center; margin-top: 15px;">
                <Button v-if="modalMode === 'register'" type="primary" @click="register()" style="margin-right: 10px;">Confirm</Button>
                <Button v-if="modalMode === 'recover'" type="primary" @click="recover()" style="margin-right: 10px;">Confirm</Button>
                <Button v-if="modalMode === 'verify'" type="primary" @click="afterRecover()" style="margin-right: 10px;">Confirm</Button>
                <Button @click="popModal = false; modalReadonly = false;">Cancel</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
import Web3 from "web3";
import CryptoJS from 'crypto-js'
import emailjs from '@emailjs/browser';
import VueQrcode from '@chenfengyuan/vue-qrcode';
export default {
    components: {
        VueQrcode
    },
    inject: ["reload"],
    data() {
        return {
            hideFooter: true,
            popModal: false,
            modalMode: 'register',
            placeHolderMap: {
                'verify': {'name': 'Code', 'placeholder': 'Enter dynamic code...', 'title': 'recovery verify'},
                'register': {'name': 'Email', 'placeholder': 'Enter recover email...', 'title': 'user registration'},
                'recover': {'name': 'Email', 'placeholder': 'Enter recover email......', 'title': 'social recovery'}
            },

            items:{
                columns:[
                    {
                        title: 'Key',
                        key: 'key',
                        align: 'center',
                        minWidth:50
                    },
                    {
                        title: 'Value',
                        key: 'value',
                        align: 'center',
                        minWidth:200
                    },
                    {
                        title: 'Action',
                        key: 'action',
                        width: 200,
                        align: 'center',
                        render: (h, params) => {
                            let btns = []
                            let self = this;
                            let needView = true;//self.items.data[params.index]['key'] !== 'Wallet' && self.items.data[params.index]['key'] !== 'Contract';
                            btns.push(h('Button', {
                                    props: {
                                        type: 'primary',
                                        disabled: needView ? false : true
                                    },
                                    on: {
                                        click: () => {
                                            console.log(self.items.data[params.index])
                                            if (self.items.data[params.index]['data']['url'] === undefined) self.executeAction(self.items.data[params.index]['key'], self.items.data[params.index]['data']['value']);
                                            else self.openLink(self.items.data[params.index]['data']['url']);
                                        }
                                    }
                                }, needView ? self.items.data[params.index]['data']['btnName']:'---')
                            );
                            return h('div', btns);
                        }
                    }
                ],
                data:[]
            },

            modelKey: '',
            modelValue: '',
            qrcodeUrl: '',
            qrcodeSize: 200,

            storeFee: 0,
            web3Key: '',
            recoverID: '',
            backendPublic: '',
            hasRegisted: false,

            hasEncrypted: false
        }
    },
    mounted: function () {
    },
    methods: {
        openLink(url) {
            window.open(url, '_blank');
        },
        init(recoverID, web3Key, backendPublic) {
            this.recoverID = recoverID;
            this.web3Key = web3Key;
            this.backendPublic = backendPublic;
            const contractAddr = this.$parent.getSelf().getWallet().contractAddrMap[this.$parent.getSelf().getWallet().networkId];
            this.addKV('Wallet', {'btnName': 'View', 'value': this.$parent.getSelf().getWalletAddress(), 'url': 'https://etherscan.io/token/' + this.$parent.getSelf().getWalletAddress()}, true);
            this.addKV('Contract', {'btnName': 'View', 'value': contractAddr, 'url': 'https://etherscan.io/token/' + contractAddr}, false);
            // this.addKV('Encrypt-Decrypt', {'value': this.$parent.getSelf().generatekey(16, false), 'btnName': 'Test'}, false);
            console.log('init privatePanel: ', web3Key, backendPublic);
        },
        addKV(k, v, bReset) {
            if (bReset === true) this.items.data = [];
            if (k === 'Encrypt-Decrypt') {
                this.items.data.pop(k);
            }
            this.items.data.push({'key': k, 'value': v['value'], 'data': v});
        },
        resetModal() {
            this.modelKey = '';
            this.modelValue = '';
        },
        register() {
            var self = this;
            if (this.modelKey === '') {
                this.$Message.error('encryption name must be non-empty');
                return;
            }
            this.popModal = false;

            var newWeb3Key = this.$parent.getSelf().generatekey(32); // TODO: encrypt by wallet

            // http
            // let formdata = new FormData();
            // // formdata.append('web3Key', newWeb3Key);
            // formdata.append('recoverID', this.modelKey);
            // formdata.append('authID', self.$parent.getSelf().getWalletAddress());

            // wasm
            let response = {};
            Register(self.$parent.getSelf().getWalletAddress(), this.modelKey, function(wasmResponse) {
                response['data'] = JSON.parse(wasmResponse);
            // // http
            // self.$parent.getSelf().httpPost('/api/user/register', formdata, function(response){
                if (response.data['Error'] !== '' && response.data['Error'] !== null && response.data['Error'] !== undefined) {
                    self.$Message.error('user registration failed');
                } else {
                    var registParams = [];
                    var web3Key = newWeb3Key;
                    var recoverID = response.data['Data']['recoverID'];
                    var backendKey = response.data['Data']['backendKey'];
                    registParams.push(Web3.utils.asciiToHex(recoverID));
                    registParams.push(Web3.utils.asciiToHex(web3Key));
                    registParams.push(Web3.utils.asciiToHex(backendKey));
                    self.$parent.getSelf().enableSpin(true);
                    self.$parent.getSelf().getWallet().Execute("send", "Register", self.$parent.getSelf().getWalletAddress(), self.storeFee, registParams, function (result) {
                        self.$parent.getSelf().enableSpin(false);
                        self.resetModal();

                        // TODO: qrcode decode by wallet
                        self.hasRegisted = true;
                        self.web3Key = newWeb3Key;
                        self.showQRcode(response.data['Data']['qrcode']);

                        // Please add an account through Google Authenticator within 1 minutes
                        var timeoutID = setTimeout(function() {
                            self.qrcodeUrl = '';
                        }, 60000);
                    }, function (err) {
                        self.$Message.error('selfCrypto register at contract failed');
                        self.$parent.getSelf().enableSpin(false);
                    })
                }
            })
        },
        beforeRecover() {
            let self = this;
            self.resetModal();
            self.modalMode = 'recover';
            self.popModal = true;
        },
        recover() {
            let self = this;
            if (this.modelKey === '') {
                this.$Message.error('pushID must be non-empty');
                return;
            }
            this.popModal = false;

            // // http
            // let formdata = new FormData();
            // formdata.append('pushID', self.modelKey);
            // formdata.append('authID', self.$parent.getSelf().getWalletAddress());
            
            // wasm
            let response = {};
            Recover(self.$parent.getSelf().getWalletAddress(), this.modelKey, function(wasmResponse) {
                response['data'] = JSON.parse(wasmResponse);
            // http
            // self.$parent.getSelf().httpPost('/api/user/recover', formdata, function(response){
                if (response.data['Error'] !== '' && response.data['Error'] !== null && response.data['Error'] !== undefined) {
                    self.$Message.error('google authenticator recover failed');
                } else {
                    // emailjs
                    var walletAddress = self.$parent.getSelf().getWalletAddress();
                    var userName = walletAddress.substring(0, 4) + "..." + walletAddress.substring(walletAddress.length - 4, walletAddress.length);
                    var templateParams = {
                        name: userName,
                        user_email: self.modelKey,
                        message: "[SelfCrypto] code for dynamic authorization: " + response.data['Data']
                    };
                    emailjs.send('service_selfcrypto', 'template_code_9lzgvhc', templateParams, 'd8z0CXeQInBbZKU4r')
                    .then((result) => {
                        console.log('email send by emailjs successed!', result.text);
                        self.$Message.success('email push successed for recovery');
                        self.resetModal();
                        self.modalMode = 'verify';
                        self.popModal = true;
                    }, (error) => {
                        console.log('email send by emailjs failed!...', error.text);
                    });
                }
            })
        },
        afterRecover() {
            let self = this;
            if (this.modelKey === '') {
                this.$Message.error('encrypted privateKey must be non-empty');
                return;
            }
            this.popModal = false; 

            // // http
            // let formdata = new FormData();
            // formdata.append('kind', 'email');
            // formdata.append('code', this.modelValue);
            // formdata.append('recoverID', this.recoverID);
            // formdata.append('recoverKey', this.modelKey);
            // formdata.append('authID', this.$parent.getSelf().getWalletAddress());

            // wasm
            let response = {};
            Auth(self.$parent.getSelf().getWalletAddress(), this.modelKey, 'email', this.recoverID, this.modelKey, function(wasmResponse) {
                response['data'] = JSON.parse(wasmResponse);
            // // http
            // self.$parent.getSelf().httpPost('/api/user/verify', formdata, function(response){
                if (response.data['Error'] !== '' && response.data['Error'] !== null && response.data['Error'] !== undefined) {
                    self.$Message.error('recovery verify for google authenticator failed');
                    if (response.data['Error'] === 'reload') {
                        self.reload();
                        return;
                    }
                } else {
                    self.resetModal();

                    // TODO: qrcode decode by wallet
                    self.showQRcode(response.data['Data']['qrcode']);
                    self.$Message.success('recovery verify for google authenticator successed');

                    // Please add an account through Google Authenticator within 1 minutes
                    var timeoutID = setTimeout(function() {
                        self.qrcodeUrl = '';
                    }, 60000);
                }
            })
        },
        executeAction(name, params) {
            let self = this;
            if (name === 'Encrypt-Decrypt') {
                if (this.hasEncrypted === false) {
                    var web3Content = CryptoJS.AES.encrypt(params, self.web3Key).toString();
                    self.$parent.getSelf().switchPanel('encrypt', '', web3Content, function(encryptedContent) {
                        console.log('executeAction successed: ', web3Content, encryptedContent)
                        self.addKV('Encrypt-Decrypt', {'value': encryptedContent, 'btnName': 'Decrypt'}, false);
                        self.hasEncrypted = true;
                    })
                } else {
                    self.$parent.getSelf().switchPanel('decrypt', '', params, function(deryptedContent) {
                        var content = CryptoJS.AES.decrypt(deryptedContent, self.web3Key).toString(CryptoJS.enc.Utf8);
                        self.addKV('Encrypt-Decrypt', {'value': content, 'btnName': 'Encrypt'}, false);
                        self.hasEncrypted = false;
                    })
                }
            } else {
                this.$parent.getSelf().afterVerify(true, params, name);
            }
        },
        showQRcode(totpKey) {
            // Google authenticator doesn't like equal signs
            var walletAddress = this.$parent.getSelf().getWalletAddress();
            let walletAddr = walletAddress.substring(0, 4) + "..." + walletAddress.substring(walletAddress.length - 4, walletAddress.length);

            // to create a URI for a qr code (change totp to hotp if using hotp)
            const totpName = 'selfCrypto-' + this.$parent.getSelf().getWallet().networkId + ':' + walletAddr;
            this.qrcodeUrl = 'otpauth://totp/' + totpName + '?secret=' + totpKey.replace(/=/g,'');
        },
        pageWidth(){
            var winWidth=0;
            if (window.innerWidth){
                winWidth = window.innerWidth;
            }
            else if ((document.body) && (document.body.clientWidth)){
                winWidth = document.body.clientWidth;
            }
            if (document.documentElement && document.documentElement.clientWidth){
                winWidth = document.documentElement.clientWidth;
            }
            return winWidth;
        },
        pageHeight(){
            var winHeight=0;
            if (window.innerHeight){
                winHeight = window.innerHeight;
            }
            else if ((document.body) && (document.body.clientHeight)){
                winHeight = document.body.clientHeight;
            }
            if (document.documentElement && document.documentElement.clientHeight){
                winHeight = document.documentElement.clientHeight;
            }
            return winHeight;
        }
    }
}
</script>