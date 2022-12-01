<template>
    <div class="top-sidebar description">
        <button type="button" class="searchBarComponent">Tìm hoặc bắt đầu cuộc trò chuyện</button>
    </div>
    <div class="list-conversations description">
        <div class="conversation" v-for="(item, index) in rooms" :id-room="index" ref="conversation" @click="onClick">
            <div class="description">
                <div class="name">
                    {{ item.username }}
                </div>
            </div>
<!--                <div v-if="item.hasNewMessages" class="new-messages">!</div>-->
        </div>
    </div>
    <div class="bottom-sidebar description">
        <div>
            <CAvatar color="secondary" status="danger">CUI</CAvatar>
            <CAvatar color="primary" status="success">CUI</CAvatar>
            <CAvatar color="primary" status="warning">CUI</CAvatar>
            <!--'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark', 'light'-->
            <span class="name">
            {{ user.username }}
        </span>
        </div>
    </div>
</template>

<script>
    import { CAvatar } from '@coreui/vue';
    import StatusIcon from "./Icon";
    import '@coreui/coreui/dist/css/coreui.min.css'
    export default {
        components: { StatusIcon, CAvatar },
        props: {
            keyA: Number,
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
        methods: {
            onClick() {
                console.log(this.$refs.conversation)
                this.$refs.conversation.class.push('selected')
                this.$emit("changeRoom", this.$refs.conversation);
            },
        },
        created() {
            console.log(this.user
                , this.rooms, this.keyA)
            let socket = this.$soketio
            // console.log(socket.sessionID, socket.userId, this.$store.state)
        }
    }
</script>