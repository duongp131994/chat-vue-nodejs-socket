<template>
    <div>
        <div class="left-panel">
            <Sidebar :initialUser="user" :initialRooms="rooms" @changeRoom="changeRoom" />
        </div>
<!--        <message-panel-->
<!--                v-if="selectedUser"-->
<!--                :user="selectedUser"-->
<!--                @formSend="onMessage"-->
<!--                class="right-panel"-->
<!--        />-->
    </div>
</template>

<script>
    import Sidebar from "./Sidebar";
    import Editor from "./Editor";
    import MessagePanel from "./MessagePanel";
    export default {
        components: { Sidebar, Editor, MessagePanel },
        data() {
            return {
                user: this.$store.state.user,
                rooms: this.$store.state.rooms
            }
        },
        methods: {
            changeRoom(datas) {
                console.log(datas)
            }
        },
        created() {
            let socket = this.$soketio
            console.log(socket.sessionID, socket.userId, this.$store.state)
        }

    }
</script>