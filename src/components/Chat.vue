<template>
    <div>
        <div class="left-panel">
            <Sidebar/>
        </div>
        <message-panel
                v-if="selectedUser"
                :user="selectedUser"
                @formSend="onMessage"
                class="right-panel"
        />
    </div>
</template>

<script>
    import Sidebar from "./Sidebar";
    import Editor from "./Editor";
    export default {
        components: { Sidbar: Sidebar, Editor },
        data() {
            return {
                conversions: []
            }
        },
        created() {
            let socket = this.$soketio
            console.log(socket.sessionID, socket.userId, this.$store.state)
        }

    }
</script>