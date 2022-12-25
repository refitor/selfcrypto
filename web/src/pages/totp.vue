<style scoped>
    .otp-wrapper {
        text-align: center;
        margin-top: 100px;
    }
    .otp-container {
        display: inline-block;
    }
    .otp-container .digits {
        width: 26px;
        height: 33px;
        margin: 0 2px;
        border: none;
        border-bottom: 2px solid rgba(0, 0, 0, .2);
        padding: 0;
        color: rgba(0, 0, 0, .7);
        margin-bottom: 0;
        padding-bottom: 0;
        font-size: 30px;
        box-shadow: none;
        text-align: center;
        background-color: none;
        font-weight: 600;
        border-radius: 0;
        outline: 0;
        transition: border 0.3s ease;
    }
    .otp-container .digits:focus {
        border-color: rgba(0, 0, 0, .5);
    }
    .otp-container .digits.otp-filled-active {
        border-color: #00bb09;
    }
    .otp-submit {
        background: #42b549;
        border: 0;
        color: #fff;
        margin-top: 15px;
        padding: 10px 15px;
        font-size: 14px;
        border-radius: 3px;
        letter-spacing: 1px;
        font-weight: 500;
        cursor: pointer;
    }
    .otp-submit[disabled] {
        opacity: 0.6;
        cursor: default;
    }
</style>
<template>
    <div class="otp-wrapper otp-event">
        <h2 style="text-align: center; margin-bottom: 10px;">Google Authenticator</h2>
        <form id="verifyForm" method="post" action="/api/auth/verify" class="otp-container">
            <input type="tel" id="digits-1" class="digits" maxlength="1" autocomplete="off" autofocus="true">
            <input type="tel" id="digits-2" class="digits" maxlength="1" autocomplete="off">
            <input type="tel" id="digits-3" class="digits" maxlength="1" autocomplete="off">
            <input type="tel" id="digits-4" class="digits" maxlength="1" autocomplete="off">
            <input type="tel" id="digits-5" class="digits" maxlength="1" autocomplete="off">
            <input type="tel" id="digits-6" class="digits" maxlength="1" autocomplete="off">
            <input type="hidden" id="code" name="code">
        </form>
        <div>
            <Button type="primary" @click="$parent.afterVerify(false)" style="margin-top: 30px; margin-right: 20px;">Back</button>
            <Button type="primary" id="confirm" @click="verify()" style="margin-top: 30px;">Verify</button>
        </div>
    </div>
</template>
<script>
export default {
    inject: ["reload"],
    data() {
        return {
            action: '',
            backendPublic: '',
            afterVerifyContent: ''
        }
    },
    mounted: function() {
    },
    methods: {
        init(action, backendPublic, afterVerifyContent) {
            this.action = action;
            this.backendPublic = backendPublic;
            this.afterVerifyContent = afterVerifyContent;
            const params = new URLSearchParams(window.location.search);
            $('.otp-event').each(function() {
                var $input = $(this).find('.digits');
                var $submit = $(this).find('.otp-submit');
                $input.keydown(function(ev) {
                    var otp_val = $(this).val();
                    if (ev.keyCode == 37) {
                        $(this).prev().focus();
                        ev.preventDefault();
                    } else if (ev.keyCode == 39) {
                        $(this).next().focus();
                        ev.preventDefault();
                    } else if (otp_val.length == 1 && ev.keyCode != 8 && ev.keyCode != 46) {
                        var otp_next_number = $(this).next();
                        if (otp_next_number.length == 1 && otp_next_number.val().length == 0) {
                            otp_next_number.focus();
                        }
                    } else if (otp_val.length == 0 && ev.keyCode == 8) {
                        $(this).prev().val("");
                        $(this).prev().focus();
                    } else if (otp_val.length == 1 && ev.keyCode == 8) {
                        $(this).val("");
                    } else if (otp_val.length == 0 && ev.keyCode == 46) {
                        var next_input = $(this).next();
                        next_input.val("");
                        while (next_input.next().length > 0) {
                            next_input.val(next_input.next().val());
                            next_input = next_input.next();
                            if (next_input.next().length == 0) {
                                next_input.val("");
                                break;
                            }
                        }
                    }

                }).focus(function() {
                    $(this).select();
                    var otp_val = $(this).prev().val();
                    if (otp_val === "") {
                        $(this).prev().focus();
                    } else if ($(this).next().val()) {
                        $(this).next().focus();
                    }
                }).keyup(function(ev) {
                    var otpCodeTemp = "";
                    $input.each(function(i) {
                        if ($(this).val().length != 0) {
                            $(this).addClass('otp-filled-active');
                        } else {
                            $(this).removeClass('otp-filled-active');
                        }
                        otpCodeTemp += $(this).val();
                    });
                    if ($(this).val().length == 1 && ev.keyCode != 37 && ev.keyCode != 39) {
                        $(this).next().focus();
                        ev.preventDefault();
                    }
                    $input.each(function(i) {
                        if ($(this).val() != '') {
                            $submit.prop('disabled', false);
                        } else {
                            $submit.prop('disabled', true);
                        }
                    });

                });
            });
        },
        verify() {
            let self = this;
            document.getElementById("code").value += document.getElementById("digits-1").value;
            document.getElementById("code").value += document.getElementById("digits-2").value;
            document.getElementById("code").value += document.getElementById("digits-3").value;
            document.getElementById("code").value += document.getElementById("digits-4").value;
            document.getElementById("code").value += document.getElementById("digits-5").value;
            document.getElementById("code").value += document.getElementById("digits-6").value;
            const inputCode = document.getElementById("code").value;

            // // http
            // let formdata = new FormData();
            // formdata.append('code', inputCode);
            // formdata.append('kind', 'google');
            // formdata.append('action', this.action);
            // formdata.append('authID', this.$parent.getSelf().getWalletAddress());
            // formdata.append('afterVerifyContent', this.afterVerifyContent);

            // wasm
            let response = {};
            Auth(this.$parent.getSelf().getWalletAddress(), inputCode, 'google', this.action, this.afterVerifyContent, function(wasmResponse) {
                response['data'] = JSON.parse(wasmResponse);
            // // http
            // self.$parent.getSelf().httpPost('/api/user/verify', formdata, function(response){
                if (response.data['Error'] !== '' && response.data['Error'] !== null && response.data['Error'] !== undefined) {
                    self.$Message.error('google authenticator verify failed');
                    self.$parent.getSelf().afterVerify(false, '');
                } else {
                    self.$Message.success('google authenticator verify successed');
                    self.$parent.getSelf().afterVerify(true, response.data['Data']);
                }
            })
        }
    }
}
</script>