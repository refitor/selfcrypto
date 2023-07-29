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
                    <div>
                        <h2 style="text-align: center; margin-bottom: 1px;">SelfCrypto</h2>
                        <Button @click="back()" type="primary" style="margin: 10px;">Back</Button>
                        <Button :disabled="(hasEncrypted === true)" @click="encrypt()" type="primary" style="margin: 10px;">Encrypt</Button>
                        <Button :disabled="(hasEncrypted === false)" @click="decrypt()" type="primary" style="margin: 10px;">Decrypt</Button>
                        <Button :disabled="(hasEncrypted === false)" @click="download()" type="primary" style="margin: 10px;">Download</Button>
                        <Upload type="drag" :before-upload="onUploadBefore" action="/" style="margin-top: 10px;">
                            <div style="padding: 20px 0">
                                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                                <p>Click or drag the file here to upload</p>
                            </div>
                            <span v-if="fileName !== ''" style="color:green;">{{ fileName }}</span>
                        </Upload>
                        <Radio-group v-model="uploadType" style="margin-top: 10px; margin-bottom: 20px;">
                            <Radio label="upload plain text"></Radio>
                            <Radio label="upload cipher text"></Radio>
                        </Radio-group>
                        <div :style="{height: pageHeight() / 2 + 'px', width: pageWidth() / 2 + 'px'}">
                            <vue-editor ref="fileEditor" v-model="content" :disabled="readonly === 'true'" :editor-toolbar="[['bold', 'italic', 'underline']]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { AES, enc } from 'crypto-js';
import Web3 from "web3";
export default {
    inject: ["reload"],
    data() {
        return {
            lang: 'text',
            content: '',
            readonly: false,
            uploadType: 'upload plain text',

            fileName: '',
            web3Key: '',
            hasEncrypted: false
        }
    },
    mounted: function () {
    },
    methods: {
        onUploadBefore(file) {
            let self = this;
            const reader = new FileReader()
            reader.readAsText(file)
            reader.onload = function () {
                if (reader.result) {
                    self.content = reader.result;
                    self.hasEncrypted = self.uploadType === 'upload plain text' ? false : true;
                }
            }
            this.fileName = file.name;
            return false;
        },
        init(web3Key) {
            let self = this;
            this.web3Key = web3Key; // decrypt by wallet
            this.hasEncrypted = false;
            console.log('init cryptoPanel: ', this.web3Key, web3Key);
        },
        back() {
            this.$parent.getSelf().switchPanel('back', 'cryptoPanel');
        },
        encrypt() {
            let self = this;
            let content = this.content;
            if (content === '') {
                this.$Message.error('content must be non-empty');
                return
            }
            content = content.replace("<p>", "");
            content = content.replace("</p>", "");
            console.log('-----------', content)

            var web3Content = AES.encrypt(content, self.web3Key).toString();
            self.$parent.getSelf().switchPanel('encrypt', 'cryptoPanel', web3Content, function(encryptedContent) {
                self.content = encryptedContent;
                self.hasEncrypted = true;
                console.log(web3Content, encryptedContent);
            })
        },
        decrypt() {
            let self = this;
            let content = this.content;
            if (content === '') {
                this.$Message.error('content must be non-empty');
                return
            }
            content = content.replace("<p>", "");
            content = content.replace("</p>", "");

            var encryptedContent = content;
            self.$parent.getSelf().switchPanel('decrypt', 'cryptoPanel', encryptedContent, function(deryptedContent) {
                self.content = AES.decrypt(deryptedContent, self.web3Key).toString(enc.Utf8);
                self.hasEncrypted = false;
                console.log(encryptedContent, deryptedContent);
            })
        },
        download() {
            let content = this.content;
            if (content === '') {
                this.$Message.error('content must be non-empty');
                return
            }
            // Create element with <a> tag
            const link = document.createElement("a");

            // Create a blog object with the file content which you want to add to the file
            content = content.replace("<p>", "");
            content = content.replace("</p>", "");
            const blob = new Blob([content], { type: 'text/plain' });
            const file = new File([blob], this.fileName);

            // Add file content in the object URL
            link.href = URL.createObjectURL(file);

            // Add file name
            link.download = this.fileName === '' ? "selfcrypto.txt" : this.fileName;

            // Add click event to <a> tag to save file.
            link.click();
            URL.revokeObjectURL(link.href);
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