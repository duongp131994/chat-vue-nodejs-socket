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
                    <router-view :userAlready="onUsernameSelection" :initialConversions="conversions" :initialUserName="userName" :initialPassword="password" @changeState="changeState"/>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import router from './router'
    export default {
        name: "App",
        components: {},
        data() {
            return {
                userAlready: false,
                conversions: [],
                test: true,
                password: localStorage.getItem("chatUserPass"),
                userName: localStorage.getItem("chatUserName")
            };
        },
        methods: {
            changeState(datas) {
                datas.map(data => this[data[0]] = data[1])
            },
            onUsernameSelection() {

            },
            onLogOut() {
                this.userAlready = false;
                localStorage.removeItem('chatUserName');
                router.push({ name: 'login'})
            }
        },
        created() {
            let socket = this.$soketio

            if (this.userName && this.password) {
                console.log( this.userName, this.password)
                socket.auth = {username: this.userName, password: this.password, createNew: false};

                socket.connect();
            }

            socket.on('session-details', ({userId, params}) => {
                console.log(userId, params, this.userName, this.password);

                this.userAlready = true;
                this.conversions = params?.conversion;
                localStorage.setItem("chatUserName", this.userName);
                localStorage.setItem("chatUserPass", this.password);

                // save the ID of the user
                socket.sessionID = this.conversions[0] || null;
                socket.userId = userId;

                router.push({ name: 'home'})
            })

            if (!this.userAlready) {
                router.push({ name: 'login'})
            }

            socket.on('error-connection', (data) => {
                alert(data.error);
                router.push({ name: 'login'})
            })
        },
        destroyed() {
            this.$soketio.off("connect_error");
        }
    }
</script>