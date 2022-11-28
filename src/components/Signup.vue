<template>
    <div class="vue-tempalte login-form">
        <h3>Sign Up</h3>
        <div class="form-group">
            <label>Email address *</label>
            <input :class="{ 'has-error': !emailValid }" type="email" class="form-control form-control-lg" @input="changeEmail" :value="email" />
        </div>
        <div class="form-group">
            <label>Company</label>
            <input type="text" class="input-group form-control form-control-lg" v-model="company" placeholder="where do you come from ッ ?"/>
        </div>
        <div class="form-group">
            <label>Password *</label>
            <input :class="{ 'has-error': !passwordValid }" ref="inputPassowrd" type="password" class="form-control form-control-lg" @input="changeInput" :value="password" />
            <button class="show-icon" @click="toggleShow">
                <icon v-if="!showPassword">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                    </svg>
                </icon>
                <icon v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                        <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                    </svg>
                </icon>
            </button>
            <span class="password-note" v-if="!passwordValid">password not validated, a password should have a lowercase letter, an uppercase letter, a number, and 8 characters minimum</span>
        </div>
        <button type="submit" class="btn btn-dark btn-lg btn-block" @click="signUp">Sign Up</button>
    </div>
</template>
<script>
    export default {
        props: {
            initialPassword: String,
            initialUserName: String
        },
        emits: ['changeState'],
        data() {
            return {
                email: this.initialUserName,
                password: this.initialPassword,
                company: '',
                showPassword: false,
                emailValid: true,
                passwordValid: true,
                reg: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/,
                regPass: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
            }
        },
        computed: {
        },
        methods: {
            changeEmail: function(e) {
                this.email = e.target.value
                this.emailValid = true
                if (!this.reg.test(this.email)) {
                    this.emailValid = false
                }
            },
            changeInput: function(e) {
                this.password = e.target.value
                this.passwordValid = true
                if (!this.regPass.test(this.password)) {
                    this.passwordValid = false
                }
            },
            toggleShow() {
                this.showPassword = !this.showPassword;
                this.$refs.inputPassowrd.type = "password";
                if (this.showPassword) {
                    this.$refs.inputPassowrd.type = "text";
                }
            },
            signUp() {
                if (this.email === "" || !this.emailValid) {
                    alert('Email not valid');
                    return false;
                }
                if (this.password === "" || !this.passwordValid) {
                    alert('Password not valid');
                    return false;
                }
                this.$emit('changeState', [['userName', this.email], ['password', this.password]])
                this.$soketio.auth = {username: this.email, password: this.password, createNew: true};

                this.$soketio.connect();
            }
        },
        created() {
            this.$soketio.on("connect_error", (err) => {
                alert(`connect error due to ${err.message}`);
            });
        },
        destroyed() {
            this.$soketio.off("connect_error");
        }
    }
</script>