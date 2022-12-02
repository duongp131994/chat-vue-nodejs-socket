<template>
    <div class="left-panel">
        <Sidebar :key="componentKey" :keyA="componentKey" :initialUser="user" :initialRooms="rooms" @changeRoom="changeRoom" />
    </div>

    <div class="right-panel"></div>

</template>

<script>
    import Sidebar from "./Sidebar";
    import Editor from "./Editor";
    import MessagePanel from "./MessagePanel";

    export default {
        components: { Sidebar, Editor, MessagePanel},
        data() {
            return {
                componentKey: 0
            }
        },
        computed: {
            user: function() {
                console.log(this.$store.state.user)
                return this.$store.state.user
            },
            rooms: function() {
                console.log(this.$store.state.rooms)
                return this.$store.state.rooms
            }
        },
        watch: {
            user: {
                handler: function () {
                    this.componentKey++
                },
                deep: true
            },
            rooms: {
                handler: function () {
                    this.componentKey++
                },
                deep: true
            }
        },
        methods: {
            changeRoom(datas) {
                console.log(datas)
            }
        },
        created() {
            console.log('chat')
            let socket = this.$soketio
        }

    }
</script>