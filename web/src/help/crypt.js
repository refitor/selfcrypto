import { Base64 } from 'js-base64';
import CryptoJS from 'crypto-js';
import { sha256 } from 'js-sha256';
import { JSEncrypt } from 'jsencrypt';

export default {
    MD5(data) {
        return CryptoJS.MD5(data).toString();
    },
    EncodeByBase64(data) {
        return CryptoJS.enc.Base64.stringify(data);
    },
    DecodeByBase64(data) {
        return CryptoJS.enc.Base64.parse(data);
    },

    EncodeURIByBase64(data) {
        return Base64.encodeURI(data);
    },
    DecodeURIByBase64(data) {
        return Base64.decode(data);
    },

    generateSign(data) {
        return sha256(data);
    },
    // program to generate random strings
    generateRandom(start, end) {
        return Math.random().toString(36).substring(start, end);
    },
    generatekey(num) {
        let library = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let key = "";
        for (var i = 0; i < num; i++) {
            let randomPoz = Math.floor(Math.random() * library.length);
            key += library.substring(randomPoz, randomPoz + 1);
        }
        return key;
    },
    rsaEncrypt(word, keyStr) {
        const jsencrypt = new JSEncrypt();
        jsencrypt.setPublicKey(keyStr);
        return jsencrypt.encrypt(word);
    },
    aesEncrypt(data, key) {
        /**
         * CipherOption, 加密的一些选项:
         *   mode: 加密模式, 可取值(CBC, CFB, CTR, CTRGladman, OFB, ECB), 都在 CryptoJS.mode 对象下
         *   padding: 填充方式, 可取值(Pkcs7, AnsiX923, Iso10126, Iso97971, ZeroPadding, NoPadding), 都在 CryptoJS.pad 对象下
         *   iv: 偏移量, mode === ECB 时, 不需要 iv
         * 返回的是一个加密对象
         */
        key = CryptoJS.enc.Utf8.parse(key);
        const cipher = CryptoJS.AES.encrypt(data, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
            iv: '',
        });
        const base64Cipher = cipher.ciphertext.toString(CryptoJS.enc.Base64);
        return base64Cipher;
    },
    aesDecrypt(encrypted, key) {
        key = CryptoJS.enc.Utf8.parse(key);
        const decipher = CryptoJS.AES.decrypt(encrypted, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
            iv: '',
        });
        const resultDecipher = CryptoJS.enc.Utf8.stringify(decipher);
        return resultDecipher;
    }
}
