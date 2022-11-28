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
                userAlready: false,
                conversions: [],
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
                localStorage.removeItem('chatUserName');
                router.push({ name: 'login'})
            }
        },
        created() {
            const username = localStorage.getItem("chatUserName");
            const password = localStorage.getItem("chatUserPass");

            if (username && password) {
                console.log(username, password, this.userName, this.password)
                socket.auth = {username, password, createNew: false};

                socket.connect();
            }

            socket.on('session-details', ({userId, params}) => {
                console.log(userId, params);

                this.userAlready = true;
                this.conversions = params?.conversion;
                socket.auth = {userId};
                localStorage.setItem("chatUserName", this.userName);
                localStorage.setItem("chatUserPass", this.password);

                // save the ID of the user
                socket.userId = userId;
                socket.sessionID = this.conversions[0] || null;
            })

            if (!this.userAlready) {
                router.push({ name: 'login'})
            }

            socket.on('error-connection', (data) => {
                alert(data.error);
            })
        },
        destroyed() {
            socket.off("connect_error");
        }
    }
</script>