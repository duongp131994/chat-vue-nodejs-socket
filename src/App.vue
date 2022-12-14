<template>
    <div class="vue-tempalte" :class="{'login-form': !userAlready }">
        <!-- Navigation -->
        <nav class="navbar shadow bg-white justify-content-between flex-nowrap flex-row">
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
                <div v-if="!userAlready" class="inner-block">
                    <router-view :initialUserName="userName" :initialPassword="password" @changeState="changeState"/>
                </div>
                <div v-else class="chat-window">
                    <router-view :initialUserName="userName" :initialPassword="password" @changeState="changeState"/>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import router from './router'
    import socket from "./socket";
    export default {
        name: "App",
        components: {},
        data() {
            return {
                userAlready: false,
                password: localStorage.getItem("chatUserPass"),
                userName: localStorage.getItem("chatUserName")
            };
        },
        methods: {
            changeState(datas) {
                datas.map(data => this[data[0]] = data[1])
            },
            onLogOut() {
                this.userAlready = false;
                localStorage.removeItem('chatUserName');
                router.push({ name: 'login'})
            }
        },
        setup(props, context) {
            if (localStorage.getItem("chatUserPass") && localStorage.getItem("chatUserName")) {
                socket.auth = {username: localStorage.getItem("chatUserName"), password: localStorage.getItem("chatUserPass"), createNew: false};

                socket.connect();
            }
        },
        async created() {
            let socket = this.$soketio

            await socket.on('userConnect', ({userId, params, date, username, sessionID}) => {
                this.userAlready = true;
                localStorage.setItem("chatUserName", this.userName);
                localStorage.setItem("chatUserPass", this.password);

                // save the ID of the user
                socket.sessionID = sessionID || null;
                socket.userId = userId;

                this.$store.commit('replace', ['user', {conversions: params?.conversion, sessionID, username, date, userId}])

                router.push({ name: 'home'})
            })

            await socket.on('conversionContents', (data) => {
                let contents = data[0]
                let threeFirstRooms = data[1]
                let room = data[1][0]
                this.$store.commit('replace', ['conversionContents', contents])
                this.$store.commit('update', [['user'], {room, threeFirstRooms}])
            })

            await socket.on('conversion-details', async (datas) => {
                let rooms = {}
                let users = {}
                await datas.map((data) => {
                    let room = data[0]
                    rooms[room?.id] = {id: room?.id, name: room?.name, users: JSON.parse(room?.users)}

                    for (let i in data[1]) {
                        let user = data[1][i]
                        if (user!== null) {
                            users[user.userId] = user
                        }
                    }
                })
                this.$store.commit('replace', ['rooms', rooms])
                this.$store.commit('replace', ['users', users])
            })

            if (!this.userAlready) {
                router.push({ name: 'login'})
            }

            socket.on("user connected", (users) => {
                if (this.$store.state.users[users.userId]) {
                    this.$store.commit('update', [['users', users.userId], {connected: true, sessionID: users.sessionID, date: users.date}])
                } else {
                    this.$store.commit('update', [['users', users.userId], {
                        connected: true,
                        date: users.date,
                        sessionID: users.sessionID,
                        username: users.username,
                        userId: users.userId
                        }
                    ])
                }
            });

            this.$soketio.on("connect_error", (err) => {
                // alert(`connect error due to ${err.message}`);
            });
            socket.on('error-connection', (data) => {
                // alert(data.error);
                router.push({ name: 'login'})
            })
        },
        destroyed() {
            this.$soketio.off("connect_error");
        }
    }
</script>