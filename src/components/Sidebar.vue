<template>
    <div>
        <div class="top-sidebar">
            <div class="description">
                <div class="name">
                    {{ user.username }} {{ user.self ? " (yourself)" : "" }}
                </div>
                <div class="status">
                    <status-icon :connected="user.connected" />{{ status }}
                </div>
            </div>
        </div>
        <div class="list-conversation"></div>
    </div>
</template>

<script>
    import StatusIcon from "./Icon";
    export default {
        components: { StatusIcon },
        props: {
            initialUser: Object,
            initialRooms: Object
        },
        emits: ['changeRoom'],
        data() {
            return {
                user: this.initialUser,
                rooms: this.initialRooms
            }
        },
        created() {
            let socket = this.$soketio
            // console.log(socket.sessionID, socket.userId, this.$store.state)
        }

    }
</script>