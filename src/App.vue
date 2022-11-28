<template>
    <div class="vue-tempalte">
        <!-- Navigation -->
        <nav class="navbar shadow bg-white rounded justify-content-between flex-nowrap flex-row fixed-top">
            <div class="container">
                <a class="navbar-brand float-left" href="./" target="_blank">
                    vndandelions.com
                </a>
                <ul class="nav navbar-nav flex-row float-right">
                    <li class="nav-item" v-if="!this.userAlready">
                        <router-link class="nav-link pr-3" to="/login">Sign in</router-link>
                    </li>
                    <li class="nav-item" v-else>
                        <a @click="onLogOut" class="router-link-active router-link-exact-active nav-link pr-3" aria-current="page">Log out</a>
                    </li>
                    <li class="nav-item">
                        <router-link class="btn btn-outline-primary" to="/signup">Sign up</router-link>
                    </li>
                </ul>
            </div>
        </nav>
        <!-- Main -->
        <div class="App">
            <div class="vertical-center">
                <div class="inner-block">
                    <router-view :userAlready="onUsernameSelection"/>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import socket from "./socket";
    import router from './router'
    export default {
        name: "App",
        components: {},
        data() {
            return {
                userAlready: true,
                login: true,
                test: true,
                password: '',
                userName: ''
            };
        },
        methods: {
            onUsernameSelection() {

            },
            onLogOut() {
                this.userAlready = false;
                router.push({ name: 'login'})
            }
        },
        created() {
            const username = localStorage.getItem("chatUserName");
            const password = localStorage.getItem("chatUserPass");

            // if (username && password) {
            if (this.test) {
                this.password = 'password';
                this.username = 'username1';
                console.log(this.password, this.username, this.test)
                // socket.auth = {username, password, createNew: false};
                socket.auth = {username: this.username, password: this.password, createNew: true};

                this.test = false
                socket.connect();
            }

            socket.on('session-details', ({sessionID, userId, params}) => {
                socket.auth = {userId};
                localStorage.setItem("chatUserName", this.userName);
                localStorage.setItem("chatUserPass", this.password);

                // save the ID of the user
                socket.sessionID = sessionID;
                socket.userId = userId;
            })

            if (!this.userAlready && this.login) {
                router.push({ name: 'login'})
            }

        },
        destroyed() {
            socket.off("connect_error");
        }
    }
</script>