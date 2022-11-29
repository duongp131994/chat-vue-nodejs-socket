<template>
    <div>
<!--        <div class="left-panel">-->
<!--            <user-->
<!--                    v-for="userId in userIds"-->
<!--                    :key="userId"-->
<!--                    :user="users[userId]"-->
<!--                    :selected="selectedUser === users[userId]"-->
<!--                    @select="onSelectUser(users[userId])"-->
<!--            />-->
<!--        </div>-->
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
    export default {
        components: { Sidbar: Sidebar, Editor },
        props: {
            initialConversions: Array,
            initialUserName: String
        },
        data() {
            return {
                conversions: this.initialConversions
            }
        },
        created() {
            let socket = this.$soketio
            console.log(socket.sessionID, this.conversions, socket.userId)
            socket.on("conversionContents", (data) => {
                console.log(data)
            });
            socket.on("conversion-details", (data) => {
                console.log(data)
            });
        }

    }
</script>