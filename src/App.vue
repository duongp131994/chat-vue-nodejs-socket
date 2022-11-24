<template>
    <div><span>test vue</span></div>
    <div id="app">
        <select-username
                v-if="!usernameAlreadySelected"
                @input1="onUsernameSelection"
        />
        <chat v-else />
    </div>
</template>

<script>
    import SelectUsername from "./components/SelectUsername";
    import Chat from "./components/Chat";
    import socket from "./socket";

    export default {
        name: "App",
        components: {
            Chat,
            SelectUsername,
        },
        data() {
            return {
                usernameAlreadySelected: false,
            };
        },
        methods: {
            onUsernameSelection(username) {
                this.usernameAlreadySelected = true;
                socket.auth = { username };
                socket.connect();
            },
        },
        created() {
            const userId = localStorage.getItem("chatuserId");

            if (userId) {
                this.usernameAlreadySelected = true;
                socket.auth = {userId};
                console.log(userId)

                socket.connect();
            }

            socket.on('session-details', ({sessionID, userId}) => {
                socket.auth = { userId };
                localStorage.setItem("chatuserId", userId);

                // save the ID of the user
                socket.sessionID = sessionID;
                socket.userId = userId;
            })

            socket.on("connect_error", (err) => {
                if (err.message === "invalid username") {
                    this.usernameAlreadySelected = false;
                }
            });
        },
        destroyed() {
            socket.off("connect_error");
        }
    }
</script>
<style>
    body {
        margin: 0;
    }
    @font-face {
        font-family: Lato;
        src: url("/public/fonts/Lato-Regular.ttf");
    }

    #app {
        font-family: Lato, Arial, sans-serif;
        font-size: 14px;
    }
</style>
