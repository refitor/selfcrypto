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
                        <Button :disabled="hasRegisted" @click="modalMode = 'regist'; popModal = true" type="primary" style="margin: 10px;">Regist</Button>
                        <Button :disabled ="true" @click="beforeRecover()" type="primary" style="margin: 10px;">Recover</Button>
                        <Button :disabled ="!hasRegisted || web3Key === ''" @click="showEnDecrypt()" type="primary" style="margin: 10px;">Encrypt-Decrypt</Button>
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
                <Button v-if="modalMode === 'regist'" type="primary" @click="regist()" style="margin-right: 10px;">Confirm</Button>
                <Button v-if="modalMode === 'recover'" type="primary" @click="recover()" style="margin-right: 10px;">Confirm</Button>
                <Button v-if="modalMode === 'verify'" type="primary" @click="afterRecover()" style="margin-right: 10px;">Confirm</Button>
                <Button @click="popModal = false; modalReadonly = false;">Cancel</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
import Web3 from "web3";
import Crypt from '../help/crypt';
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
            modalMode: 'regist',
            placeHolderMap: {
                'verify': {'name': 'Code', 'placeholder': 'Enter dynamic code...', 'title': 'recovery verify'},
                'regist': {'name': 'Email', 'placeholder': 'Enter recover email...', 'title': 'user registration'},
                'recover': {'name': 'Email', 'placeholder': 'Enter recover email......', 'title': 'backend recovery'}
            },

            items:{
                columns:[
                    {
                        title: 'Key',
                        key: 'key',
                        align: 'center',
                        minWidth:100
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
                            let needView = self.items.data[params.index]['key'] !== 'Wallet' && self.items.data[params.index]['key'] !== 'Contract';
                            btns.push(h('Button', {
                                    props: {
                                        type: 'primary',
                                        disabled: needView ? false : true
                                    },
                                    on: {
                                        click: () => {
                                        }
                                    }
                                }, needView ? 'View':'---')
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
            hasRegisted: false
        }
    },
    mounted: function () {
    },
    methods: {
        init(recoverID, web3Key, backendPublic) {
            this.recoverID = recoverID;
            this.web3Key = web3Key;
            this.backendPublic = backendPublic;
            this.addKV('Wallet', this.$parent.getSelf().getWalletAddress(), true);
            this.addKV('Contract', this.$parent.getSelf().getWallet().contractAddr, false);
            console.log('init privatePanel: ', web3Key, backendPublic)
        },
        addKV(k, v, bReset) {
            if (bReset === true) this.items.data = [];
            this.items.data.push({'key': k, 'value': v});
        },
        resetModal() {
            this.modelKey = '';
            this.modelValue = '';
        },
        regist() {
            var self = this;
            if (this.modelKey === '') {
                this.$Message.error('encryption name must be non-empty');
                return;
            }
            this.popModal = false;

            var newWeb3Key = Crypt.generatekey(32); // TODO: encrypt by wallet

            // http
            // let formdata = new FormData();
            // // formdata.append('web3Key', newWeb3Key);
            // formdata.append('recoverID', this.modelKey);
            // formdata.append('authID', self.$parent.getSelf().getWalletAddress());

            // wasm
            let response = {};
            Regist(self.$parent.getSelf().getWalletAddress(), this.modelKey, function(wasmResponse) {
                response['data'] = JSON.parse(wasmResponse);
            // // http
            // self.$parent.getSelf().httpPost('/api/user/regist', formdata, function(response){
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
                    self.$parent.getSelf().getWallet().Execute("send", "Regist", self.$parent.getSelf().getWalletAddress(), self.storeFee, registParams, function (result) {
                        self.resetModal();

                        // TODO: qrcode decode by wallet
                        self.hasRegisted = true;
                        self.web3Key = newWeb3Key;
                        self.showQRcode(response.data['Data']['qrcode']);

                        // Please add an account through Google Authenticator within 1 minutes
                        var timeoutID = setTimeout(function() {
                            self.qrcodeUrl = '';
                        }, 60000);
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
                    self.$Message.success('email push successed for recovery');
                    self.resetModal();
                    self.modalMode = 'verify';
                    self.popModal = true;
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
        showEnDecrypt() {
            // this.$parent.getSelf().switchPanel('verify', this.web3Key);
            this.$parent.getSelf().afterVerify(true, this.web3Key, null);
        },
        showQRcode(totpKey) {
            // Google authenticator doesn't like equal signs
            var walletAddress = this.$parent.getSelf().getWalletAddress();
            let walletAddr = walletAddress.substring(0, 4) + "..." + walletAddress.substring(walletAddress.length - 4, walletAddress.length);

            // to create a URI for a qr code (change totp to hotp if using hotp)
            this.qrcodeUrl = 'otpauth://totp/selfData:' + walletAddr + '?secret=' + totpKey.replace(/=/g,'');
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