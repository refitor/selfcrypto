(window.webpackJsonp=window.webpackJsonp||[]).push([["app"],{0:function(e,t,n){e.exports=n("56d7")},1:function(e,t){},10:function(e,t){},11:function(e,t){},"16a2":function(e,t,n){"use strict";n("469e")},1921:function(e,t,n){},2:function(e,t){},"23f3":function(e,t,n){"use strict";var a=n("c0d8"),i=n.n(a),o=(a=n("5aac"),n.n(a)),r=(a=n("4c41"),n.n(a)),s=n("2eaf");a={data(){return{network:"",connect:!1,web3:null,providerOptions:{metamaskconnect:{package:r.a,options:{infuraId:"https://"+this.network+".infura.io/v3/516bcfb479444f8a81b967f7a5b4dd7e"}},walletconnect:{package:s.a,options:{infuraId:"https://"+this.network+".infura.io/v3/516bcfb479444f8a81b967f7a5b4dd7e"}}},contractAddrMap:{goerli:"0x76ed6874899fC86D3bfaaabc75942B1Db6209410",mainnet:"0xec04F8Ee0493f3d763AB1624BB6aAcaCD94Ac4C1"},contractABI:[{inputs:[{internalType:"bytes",name:"signature",type:"bytes"},{internalType:"bytes",name:"message",type:"bytes"}],name:"Load",outputs:[{internalType:"bytes",name:"recoverID",type:"bytes"},{internalType:"bytes",name:"web3Key",type:"bytes"},{internalType:"bytes",name:"backendKey",type:"bytes"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes",name:"recoverID",type:"bytes"},{internalType:"bytes",name:"web3Key",type:"bytes"},{internalType:"bytes",name:"backendKey",type:"bytes"}],name:"Register",outputs:[],stateMutability:"payable",type:"function"},{inputs:[],name:"Meta",outputs:[{internalType:"uint256",name:"storeFee",type:"uint256"},{internalType:"address",name:"nftAddr",type:"address"},{internalType:"uint256",name:"registTotal",type:"uint256"}],stateMutability:"view",type:"function"}]}},mounted(){void 0!==localStorage.getItem("network")&&null!==localStorage.getItem("network")&&this.setNetwork(localStorage.getItem("network"))},methods:{setNetwork(e){this.network=e,void 0!==localStorage.getItem("wallet")&&null!==localStorage.getItem("wallet")&&(e=this.initWeb3Modal(),this.initWeb3(e))},selectNetwork(e){this.setNetwork(e.value),localStorage.setItem("network",e.value)},async init(){var e=this.initWeb3Modal();await e.clearCachedProvider(),await this.initWeb3(e)},async uninit(){await this.initWeb3Modal().clearCachedProvider(),this.ondisconnect()},initWeb3Modal(){var e=this.network,t=this.providerOptions;return new o.a({network:e,cacheProvider:!0,providerOptions:t})},async initWeb3(e){e=await e.connect(),this.web3=new i.a(e);let t=await this.web3.eth.net.getNetworkType();if((t="main"===t?"mainnet":t)!==this.network)this.$Modal.error({title:"invalid network: "+t,content:"Please switch Ethereum network to "+this.network}),await this.uninit();else{let t=this;var n=await this.web3.eth.getAccounts();this.onConnect(n[0]),e.on("accountsChanged",e=>{t.ondisconnect()}),e.on("chainChanged",e=>{t.ondisconnect()}),e.on("disconnect",e=>{t.ondisconnect()})}},onConnect(e){this.connect=!0,localStorage.setItem("wallet",e),this.$parent.onAccountChanged("connect",this.network,e)},ondisconnect(){this.web3=null,this.connect=!1,localStorage.removeItem("wallet"),this.$parent.onAccountChanged("disconnect",this.network,"")},getWeb3(){return this.web3},async Execute(e,t,n,a,o,r,s){t=new this.web3.eth.Contract(this.contractABI,this.contractAddrMap[this.network]).methods[t];let l=this,c={};c=0===o.length?t():t(...o),void 0!==a&&0<a&&(a=i.a.utils.toBN(i.a.utils.toWei(a+"","ether"))),"call"===e?await c.call({from:n},(function(e,t){e?null!=s&&s(e.message):null!=r&&r(t)})):"send"===e&&(t=await c.estimateGas({from:n,value:a}),await c.send({from:n,value:a,gasLimit:t}).on("transactionHash",(function(e){l.$Message.success("web3Execute run succesed: ",e)})).on("confirmation",(function(e,t){})).on("receipt",(function(e){null!=r&&r(e)})).on("error",(function(e){null!=s&&s(e.message)})))}}},n("16a2"),n=n("2877"),n=Object(n.a)(a,(function(){var e=this,t=e._self._c;return t("div",[t("Row",{staticStyle:{height:"60px","background-color":"#ebe9e7","vertical-align":"middle"}},[t("Col",{attrs:{span:"12"}},[t("div",{staticStyle:{"text-align":"left"}},[t("div",{staticClass:"nav-header-left"},[t("Select",{staticStyle:{width:"90px","text-align":"center"},attrs:{placeholder:"network"},on:{"on-select":e.selectNetwork},model:{value:e.network,callback:function(t){e.network=t},expression:"network"}},[t("Option",{attrs:{value:"mainnet"}},[e._v("mainnet")]),t("Option",{attrs:{value:"goerli"}},[e._v("goerli")]),t("Option",{attrs:{disabled:"",value:"rinkby"}},[e._v("rinkby")])],1)],1)])]),t("Col",{attrs:{span:"12"}},[t("div",{staticStyle:{"text-align":"right","margin-top":"5px"}},[t("Button",{staticStyle:{"margin-top":"10px","margin-right":"10px"},attrs:{disabled:""===e.network,type:"primary"},on:{click:function(t){e.connect?e.uninit():e.init()}}},[e._v(e._s(e.connect?"Disconnect":"Connect Wallet"))])],1)])],1)],1)}),[],!1,null,"4e65bd22",null);t.a=n.exports},3:function(e,t){},4:function(e,t){},"469e":function(e,t,n){},5:function(e,t){},"56d7":function(e,t,n){"use strict";n.r(t);t=n("2b0e");var a=n("f825"),i=(a=n.n(a),n("f8ce"),{name:"App",provide(){return{reload:this.reload}},data:()=>({isRouterAlive:!0}),created(){const e=new Go;WebAssembly.instantiateStreaming(fetch("selfcrypto.wasm"),e.importObject).then(t=>e.run(t.instance))},methods:{reload(){this.isRouterAlive=!1,this.$nextTick((function(){this.isRouterAlive=!0}))}}}),o=n("2877"),r=Object(o.a)(i,(function(){var e=this._self._c;return e("div",{attrs:{id:"app"}},[this.isRouterAlive?e("router-view"):this._e()],1)}),[],!1,null,null,null).exports,s=(i=n("8c4f"),n("ce78").a);o=Object(o.a)(s,(function(){var e=this,t=e._self._c;return t("div",[t("WalletPanel",{ref:"walletPanel",attrs:{onAccountChanged:e.onAccountChanged}}),e.showTOTP?t("TOTPPanel",{ref:"totpPanel",attrs:{getSelf:e.getSelf}}):e._e(),t("CryptoPanel",{directives:[{name:"show",rawName:"v-show",value:e.showCryptoPanel&&!e.showTOTP,expression:"showCryptoPanel && !showTOTP"}],ref:"cryptoPanel",attrs:{getSelf:e.getSelf}}),t("PrivatePanel",{directives:[{name:"show",rawName:"v-show",value:!e.showCryptoPanel&&!e.showTOTP,expression:"!showCryptoPanel && !showTOTP"}],ref:"privatePanel",attrs:{getSelf:e.getSelf}})],1)}),[],!1,null,null,null).exports,t.default.use(i.a),s=[{path:"/",name:"Home",component:o}],o=new i.a({routes:s}),i=n("00e7"),s=n.n(i),i=n("bc3a"),n=n.n(i);t.default.use(a.a),t.default.config.productionTip=!1,t.default.prototype.$cookie=s.a,n.a.defaults.withCredentials=!1,t.default.prototype.$axios=n.a,new t.default({router:o,render:e=>e(r)}).$mount("#app")},"57e1":function(e,t,n){"use strict";n("bcbd")},6:function(e,t){},7:function(e,t){},8:function(e,t){},9:function(e,t){},a665:function(e,t,n){"use strict";var a={inject:["reload"],data:()=>({action:"",backendPublic:"",afterVerifyContent:""}),mounted:function(){},methods:{init(e,t,n){this.action=e,this.backendPublic=t,this.afterVerifyContent=n,new URLSearchParams(window.location.search),$(".otp-event").each((function(){var e=$(this).find(".digits"),t=$(this).find(".otp-submit");e.keydown((function(e){var t=$(this).val();if(37==e.keyCode)$(this).prev().focus(),e.preventDefault();else if(39==e.keyCode)$(this).next().focus(),e.preventDefault();else if(1==t.length&&8!=e.keyCode&&46!=e.keyCode){var n=$(this).next();1==n.length&&0==n.val().length&&n.focus()}else if(0==t.length&&8==e.keyCode)$(this).prev().val(""),$(this).prev().focus();else if(1==t.length&&8==e.keyCode)$(this).val("");else if(0==t.length&&46==e.keyCode){var a=$(this).next();for(a.val("");0<a.next().length;)if(a.val(a.next().val()),0==(a=a.next()).next().length){a.val("");break}}})).focus((function(){$(this).select(),""===$(this).prev().val()?$(this).prev().focus():$(this).next().val()&&$(this).next().focus()})).keyup((function(n){e.each((function(e){0!=$(this).val().length?$(this).addClass("otp-filled-active"):$(this).removeClass("otp-filled-active"),$(this).val()})),1==$(this).val().length&&37!=n.keyCode&&39!=n.keyCode&&($(this).next().focus(),n.preventDefault()),e.each((function(e){""!=$(this).val()?t.prop("disabled",!1):t.prop("disabled",!0)}))}))}))},verify(){let e=this;document.getElementById("code").value+=document.getElementById("digits-1").value,document.getElementById("code").value+=document.getElementById("digits-2").value,document.getElementById("code").value+=document.getElementById("digits-3").value,document.getElementById("code").value+=document.getElementById("digits-4").value,document.getElementById("code").value+=document.getElementById("digits-5").value,document.getElementById("code").value+=document.getElementById("digits-6").value;var t=document.getElementById("code").value;let n={};Auth(this.$parent.getSelf().getWalletAddress(),t,"google",this.action,this.afterVerifyContent,(function(t){n.data=JSON.parse(t),""!==n.data.Error&&null!==n.data.Error&&void 0!==n.data.Error?"reload"===n.data.Error?e.reload():(e.$Message.error("google authenticator verify failed"),e.$parent.getSelf().afterVerify(!1,"")):(e.$Message.success("google authenticator verify successed"),e.$parent.getSelf().afterVerify(!0,n.data.Data))}))}}};n("cbdc"),n=n("2877"),n=Object(n.a)(a,(function(){var e=this,t=e._self._c;return t("div",{staticClass:"otp-wrapper otp-event"},[t("h2",{staticStyle:{"text-align":"center","margin-bottom":"10px"}},[e._v("Google Authenticator")]),e._m(0),t("div",[t("Button",{staticStyle:{"margin-top":"30px","margin-right":"20px"},attrs:{type:"primary"},on:{click:function(t){return e.$parent.afterVerify(!1)}}},[e._v("Back")]),t("Button",{staticStyle:{"margin-top":"30px"},attrs:{type:"primary",id:"confirm"},on:{click:function(t){return e.verify()}}},[e._v("Verify")])],1)])}),[function(){var e=this._self._c;return e("form",{staticClass:"otp-container",attrs:{id:"verifyForm",method:"post",action:"/api/auth/verify"}},[e("input",{staticClass:"digits",attrs:{type:"tel",id:"digits-1",maxlength:"1",autocomplete:"off",autofocus:"true"}}),e("input",{staticClass:"digits",attrs:{type:"tel",id:"digits-2",maxlength:"1",autocomplete:"off"}}),e("input",{staticClass:"digits",attrs:{type:"tel",id:"digits-3",maxlength:"1",autocomplete:"off"}}),e("input",{staticClass:"digits",attrs:{type:"tel",id:"digits-4",maxlength:"1",autocomplete:"off"}}),e("input",{staticClass:"digits",attrs:{type:"tel",id:"digits-5",maxlength:"1",autocomplete:"off"}}),e("input",{staticClass:"digits",attrs:{type:"tel",id:"digits-6",maxlength:"1",autocomplete:"off"}}),e("input",{attrs:{type:"hidden",id:"code",name:"code"}})])}],!1,null,"35360dec",null);t.a=n.exports},bcbd:function(e,t,n){},be61:function(e,t,n){"use strict";n("e14b")},cbdc:function(e,t,n){"use strict";n("1921")},ce78:function(e,t,n){"use strict";(function(e){var a=n("c0d8"),i=n.n(a),o=(a=n("a665"),n("23f3")),r=n("ddaa"),s=n("d566");t.a={components:{TOTPPanel:a.a,WalletPanel:o.a,CryptoPanel:r.a,PrivatePanel:s.a},inject:["reload"],data:()=>({network:"",connect:!1,publicKey:"",walletAddress:"",showTOTP:!1,justVerify:!1,showCryptoPanel:!1,backendPublic:"",afterVerifyFunc:null,apiPrefix:"",loadRandom:"",loadSignature:""}),methods:{getSelf(){return this},onAccountChanged(e,t,n){let a=this;"connect"===e?(this.network=t,this.connect=!0,this.modelAuthID=n,this.walletAddress=n,this.loadRandom=this.generatekey(6,!1),a.sign(i.a.utils.soliditySha3("Ethereum Signed Message:\n32",this.loadRandom),(function(e){a.loadSignature=e,a.load()}))):"disconnect"===e&&(this.network="",this.connect=!1,this.walletAddress="")},load(){function e(e,n,a){let o={};Load(t.walletAddress,t.getPublic(i.a.utils.soliditySha3("Ethereum Signed Message:\n32",t.loadRandom),t.loadSignature),n,(function(n){o.data=JSON.parse(n),null!==o.data.Data&&void 0!==o.data.Data&&o.data.Data!=={}?(t.backendPublic=o.data.Data,t.$refs.privatePanel.init(e,a,t.backendPublic)):t.$Message.error("selfCrypto load from backend failed: ",+o.data.Data)}))}let t=this;var n=[];n.push(this.loadSignature),n.push(i.a.utils.asciiToHex(this.loadRandom)),t.$refs.walletPanel.Execute("call","Load",t.walletAddress,0,n,(function(n){t.$refs.privatePanel.hasRegisted=!0;var a=i.a.utils.hexToAscii(n.web3Key);e(i.a.utils.hexToAscii(n.recoverID),n=i.a.utils.hexToAscii(n.backendKey),a)}),(function(n){t.$Message.error("selfCrypto load from contract failed"),e("","","")}))},getWalletAddress(){return this.walletAddress},getWallet(){return this.$refs.walletPanel},switchPanel(e,t,n){if("back"===e||""===e)this.showCryptoPanel=!1;else{this.afterVerifyFunc=n;let a=this;this.showTOTP=!0,this.$nextTick((function(){a.$refs.totpPanel.init(e,a.backendPublic,t)}))}},afterVerify(e,t){!(this.showTOTP=!1)===e&&(null!==this.afterVerifyFunc&&void 0!==this.afterVerifyFunc?this.afterVerifyFunc(t):(this.showCryptoPanel=!this.showCryptoPanel,this.$refs.cryptoPanel.init(t)))},sign(e,t){let n=this;var a=this.getWalletAddress();this.$refs.walletPanel.getWeb3().eth.sign(e,a).then((function(e){null!=t&&t(e)})).catch((function(t){n.$Message.error("sign message failed at web3: ",e,t)}))},getPublic(t,a){a=a.split("x")[1];var o=new e(a.substring(0,64),"hex"),r=new e(a.substring(64,128),"hex");a=new e((parseInt(a.substring(128,130))+27).toString());return t=n("b671").ecrecover(i.a.utils.hexToBytes(t),a,o,r).toString("hex")},generatekey(e,t){let n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",a=(!0===t&&(n="0123456789"),"");for(var i=0;i<e;i++){var o=Math.floor(Math.random()*n.length);a+=n.substring(o,o+1)}return a},httpGet(e,t,n){this.$axios.get(this.apiPrefix+e).then((function(e){null!=t&&t(e)})).catch((function(e){}))},httpPost(e,t,n,a){this.$axios.post(this.apiPrefix+e,t).then((function(e){null!=n&&n(e)})).catch((function(e){}))}}}}).call(this,n("1c35").Buffer)},d566:function(e,t,n){"use strict";var a=n("c0d8"),i=n.n(a),o=n("9d6e");a=n("b2e5"),a={components:{VueQrcode:n.n(a).a},inject:["reload"],data(){return{hideFooter:!0,popModal:!1,modalMode:"register",placeHolderMap:{verify:{name:"Code",placeholder:"Enter dynamic code...",title:"recovery verify"},register:{name:"Email",placeholder:"Enter recover email...",title:"user registration"},recover:{name:"Email",placeholder:"Enter recover email......",title:"backend recovery"}},items:{columns:[{title:"Key",key:"key",align:"center",minWidth:100},{title:"Value",key:"value",align:"center",minWidth:200},{title:"Action",key:"action",width:200,align:"center",render:(e,t)=>{var n=[];t="Wallet"!==this.items.data[t.index].key&&"Contract"!==this.items.data[t.index].key;return n.push(e("Button",{props:{type:"primary",disabled:!t},on:{click:()=>{}}},t?"View":"---")),e("div",n)}}],data:[]},modelKey:"",modelValue:"",qrcodeUrl:"",qrcodeSize:200,storeFee:0,web3Key:"",recoverID:"",backendPublic:"",hasRegisted:!1}},mounted:function(){},methods:{init(e,t,n){this.recoverID=e,this.web3Key=t,this.backendPublic=n,e=this.$parent.getSelf().getWallet().contractAddrMap[this.$parent.getSelf().getWallet().network],this.addKV("Wallet",this.$parent.getSelf().getWalletAddress(),!0),this.addKV("Contract",e,!1)},addKV(e,t,n){!0===n&&(this.items.data=[]),this.items.data.push({key:e,value:t})},resetModal(){this.modelKey="",this.modelValue=""},register(){var e=this;if(""===this.modelKey)this.$Message.error("encryption name must be non-empty");else{this.popModal=!1;var t=this.$parent.getSelf().generatekey(32);let n={};Register(e.$parent.getSelf().getWalletAddress(),this.modelKey,(function(a){var o,r,s;n.data=JSON.parse(a),""!==n.data.Error&&null!==n.data.Error&&void 0!==n.data.Error?e.$Message.error("user registration failed"):(a=[],o=t,r=n.data.Data.recoverID,s=n.data.Data.backendKey,a.push(i.a.utils.asciiToHex(r)),a.push(i.a.utils.asciiToHex(o)),a.push(i.a.utils.asciiToHex(s)),e.$parent.getSelf().getWallet().Execute("send","Register",e.$parent.getSelf().getWalletAddress(),e.storeFee,a,(function(a){e.resetModal(),e.hasRegisted=!0,e.web3Key=t,e.showQRcode(n.data.Data.qrcode),setTimeout((function(){e.qrcodeUrl=""}),6e4)})))}))}},beforeRecover(){this.resetModal(),this.modalMode="recover",this.popModal=!0},recover(){let e=this;if(""===this.modelKey)this.$Message.error("pushID must be non-empty");else{this.popModal=!1;let t={};Recover(e.$parent.getSelf().getWalletAddress(),this.modelKey,(function(n){t.data=JSON.parse(n),""!==t.data.Error&&null!==t.data.Error&&void 0!==t.data.Error?e.$Message.error("google authenticator recover failed"):(n={name:(n=e.$parent.getSelf().getWalletAddress()).substring(0,4)+"..."+n.substring(n.length-4,n.length),user_email:e.modelKey,message:"[SelfCrypto] code for dynamic authorization: "+t.data.Data},o.a.send("service_selfcrypto","template_code_9lzgvhc",n,"d8z0CXeQInBbZKU4r").then(t=>{e.$Message.success("email push successed for recovery"),e.resetModal(),e.modalMode="verify",e.popModal=!0},e=>{}))}))}},afterRecover(){let e=this;if(""===this.modelKey)this.$Message.error("encrypted privateKey must be non-empty");else{this.popModal=!1;let t={};Auth(e.$parent.getSelf().getWalletAddress(),this.modelKey,"email",this.recoverID,this.modelKey,(function(n){t.data=JSON.parse(n),""!==t.data.Error&&null!==t.data.Error&&void 0!==t.data.Error?(e.$Message.error("recovery verify for google authenticator failed"),"reload"===t.data.Error&&e.reload()):(e.resetModal(),e.showQRcode(t.data.Data.qrcode),e.$Message.success("recovery verify for google authenticator successed"),setTimeout((function(){e.qrcodeUrl=""}),6e4))}))}},showEnDecrypt(){this.$parent.getSelf().afterVerify(!0,this.web3Key,null)},showQRcode(e){var t=(t=this.$parent.getSelf().getWalletAddress()).substring(0,4)+"..."+t.substring(t.length-4,t.length);this.qrcodeUrl="otpauth://totp/selfData:"+t+"?secret="+e.replace(/=/g,"")},pageWidth(){var e=0;return window.innerWidth?e=window.innerWidth:document.body&&document.body.clientWidth&&(e=document.body.clientWidth),document.documentElement&&document.documentElement.clientWidth?document.documentElement.clientWidth:e},pageHeight(){var e=0;return window.innerHeight?e=window.innerHeight:document.body&&document.body.clientHeight&&(e=document.body.clientHeight),document.documentElement&&document.documentElement.clientHeight?document.documentElement.clientHeight:e}}},n("57e1"),n=n("2877"),n=Object(n.a)(a,(function(){var e=this,t=e._self._c;return t("div",[t("div",{staticClass:"layout"},[t("div",{staticClass:"layout-content-center"},[t("div",[t("div",{staticStyle:{margin:"10px"}},[t("h2",{staticStyle:{"margin-bottom":"3px"}},[e._v("SelfCrypto")]),t("Button",{staticStyle:{margin:"10px"},attrs:{disabled:e.hasRegisted,type:"primary"},on:{click:function(t){e.modalMode="register",e.popModal=!0}}},[e._v("Regist")]),t("Button",{staticStyle:{margin:"10px"},attrs:{disabled:!e.hasRegisted,type:"primary"},on:{click:function(t){return e.beforeRecover()}}},[e._v("Recover")]),t("Button",{staticStyle:{margin:"10px"},attrs:{disabled:!e.hasRegisted||""===e.web3Key,type:"primary"},on:{click:function(t){return e.showEnDecrypt()}}},[e._v("Encrypt-Decrypt")]),t("Table",{staticStyle:{"margin-top":"8px"},attrs:{border:"","no-data-text":"empty key/value list",columns:e.items.columns,data:e.items.data}})],1),""!==e.qrcodeUrl?t("VueQrcode",{attrs:{value:e.qrcodeUrl,options:{width:150}}}):e._e(),""!==e.qrcodeUrl?t("h3",{staticStyle:{"text-align":"center"}},[e._v("Please add an account through Google Authenticator within 1 minutes.")]):e._e()],1)])]),t("Modal",{attrs:{"footer-hide":e.hideFooter,"class-name":"vertical-center-modal"},model:{value:e.popModal,callback:function(t){e.popModal=t},expression:"popModal"}},[t("p",{staticStyle:{"text-align":"center","margin-bottom":"10px"}},[e._v(e._s(e.placeHolderMap[e.modalMode].title))]),t("Input",{attrs:{type:"email",placeholder:e.placeHolderMap[e.modalMode].placeholder},model:{value:e.modelKey,callback:function(t){e.modelKey=t},expression:"modelKey"}},[t("span",{attrs:{slot:"prepend"},slot:"prepend"},[e._v(e._s(e.placeHolderMap[e.modalMode].name))])]),t("div",{staticStyle:{"text-align":"center","margin-top":"15px"}},["register"===e.modalMode?t("Button",{staticStyle:{"margin-right":"10px"},attrs:{type:"primary"},on:{click:function(t){return e.register()}}},[e._v("Confirm")]):e._e(),"recover"===e.modalMode?t("Button",{staticStyle:{"margin-right":"10px"},attrs:{type:"primary"},on:{click:function(t){return e.recover()}}},[e._v("Confirm")]):e._e(),"verify"===e.modalMode?t("Button",{staticStyle:{"margin-right":"10px"},attrs:{type:"primary"},on:{click:function(t){return e.afterRecover()}}},[e._v("Confirm")]):e._e(),t("Button",{on:{click:function(t){e.popModal=!1,e.modalReadonly=!1}}},[e._v("Cancel")])],1)],1)],1)}),[],!1,null,"6bf286fe",null);t.a=n.exports},ddaa:function(e,t,n){"use strict";var a=n("11f7"),i=(a=(n("3452"),n("c0d8"),{components:{Editor:a.a},inject:["reload"],data:()=>({lang:"text",content:"",readonly:!1,fileName:"",editorOptions:{enableBasicAutocompletion:!0,enableSnippets:!0,enableLiveAutocompletion:!0,tabSize:2,fontSize:16,showPrintMargin:!1},web3Key:"",hasEncrypted:!1}),mounted:function(){},methods:{onUploadBefore(e){let t=this;const n=new FileReader;return n.readAsText(e),n.onload=function(){n.result&&(t.content=n.result)},this.fileName=e.name,!1},init(e){this.web3Key=e,this.hasEncrypted=!1},back(){this.$parent.getSelf().switchPanel("back")},encrypt(){let e=this;var t=this.$refs.fileEditor.getValue();""===t?this.$Message.error("content must be non-empty"):(t=n("3452").AES.encrypt(t,e.web3Key).toString(),e.$parent.getSelf().switchPanel("encrypt",t,(function(t){e.content=t,e.hasEncrypted=!0})))},decrypt(){let e=this;var t,a=this.$refs.fileEditor.getValue();""===a?this.$Message.error("content must be non-empty"):(t=n("3452"),e.$parent.getSelf().switchPanel("decrypt",a,(function(n){e.content=t.AES.decrypt(n,e.web3Key).toString(t.enc.Utf8),e.hasEncrypted=!1})))},download(){var e,t=this.$refs.fileEditor.getValue();""===t?this.$Message.error("content must be non-empty"):(e=document.createElement("a"),t=new Blob([t],{type:"text/plain"}),e.href=URL.createObjectURL(t),e.download=""===this.fileName?"selfcrypto.json":this.fileName,e.click(),URL.revokeObjectURL(e.href))},editorInit(){n("2099"),n("8a2a"),n("24b9"),n("95b8"),n("818b"),n("0329"),n("2968"),n("b039")},editorChange(e){},editorInput(e){},editorFocus(e){},editorBlur(e){},editorPaste(e){},pageWidth(){var e=0;return window.innerWidth?e=window.innerWidth:document.body&&document.body.clientWidth&&(e=document.body.clientWidth),document.documentElement&&document.documentElement.clientWidth?document.documentElement.clientWidth:e},pageHeight(){var e=0;return window.innerHeight?e=window.innerHeight:document.body&&document.body.clientHeight&&(e=document.body.clientHeight),document.documentElement&&document.documentElement.clientHeight?document.documentElement.clientHeight:e}}}),n("be61"),n("2877"));i=Object(i.a)(a,(function(){var e=this,t=e._self._c;return t("div",[t("div",{staticClass:"layout"},[t("div",{staticClass:"layout-content-center"},[t("div",[t("div",[t("h2",{staticStyle:{"text-align":"center","margin-bottom":"1px"}},[e._v("SelfCrypto")]),t("Button",{staticStyle:{margin:"10px"},attrs:{type:"primary"},on:{click:function(t){return e.back()}}},[e._v("Back")]),t("Button",{staticStyle:{margin:"10px"},attrs:{disabled:!0===e.hasEncrypted,type:"primary"},on:{click:function(t){return e.encrypt()}}},[e._v("Encrypt")]),t("Button",{staticStyle:{margin:"10px"},attrs:{disabled:!1===e.hasEncrypted,type:"primary"},on:{click:function(t){return e.decrypt()}}},[e._v("Decrypt")]),t("Button",{staticStyle:{margin:"10px"},attrs:{disabled:!1===e.hasEncrypted,type:"primary"},on:{click:function(t){return e.download()}}},[e._v("Download")]),t("Upload",{staticStyle:{"margin-top":"10px","margin-bottom":"20px"},attrs:{type:"drag","before-upload":e.onUploadBefore,action:"/"}},[t("div",{staticStyle:{padding:"20px 0"}},[t("Icon",{staticStyle:{color:"#3399ff"},attrs:{type:"ios-cloud-upload",size:"52"}}),t("p",[e._v("Click or drag the file here to upload")])],1),""!==e.fileName?t("span",{staticStyle:{color:"green"}},[e._v(e._s(e.fileName))]):e._e()]),t("Editor",{ref:"fileEditor",attrs:{content:e.content,fontSize:14,height:2*e.pageHeight()/3,width:e.pageWidth()/2,lang:e.lang,theme:"chrome",options:e.editorOptions,readonly:"true"===e.readonly},on:{init:e.editorInit,onChange:e.editorChange,onInput:e.editorInput,onFocus:e.editorFocus,onBlur:e.editorBlur,onPaste:e.editorPaste}})],1)])])])])}),[],!1,null,"36cb554a",null);t.a=i.exports},e14b:function(e,t,n){}},[[0,"runtime","npm.walletconnect","npm.crypto-js","npm.eth-json-rpc-filters","npm.keccak","npm.elliptic","npm.hash-base","npm.readable-stream","npm.brace","npm.ethereumjs-abi","npm.node-libs-browser","npm.view-design","npm.rlp","npm.chenfengyuan","npm.bn.js","npm.vue-router","npm.vue","npm.web3","npm.web3modal","vendors~app"]]]);