<template>
    <div class="top-sidebar description">
        <button type="button" class="searchBarComponent">Tìm hoặc bắt đầu cuộc trò chuyện</button>
    </div>
    <div class="list-conversations description">
        <div class="conversation" v-for="(item, index) in rooms" :id-room="index">
            <div class="description">
                <div @click="onClick(item)">
                    <CAvatar text-color="white" color="dark">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18">
                            <g fill="none" fill-rule="evenodd" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"
                               stroke-width="1" transform="translate(1 1)">
                                <path d="M16 18v-2a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v2"/>
                                <circle cx="8" cy="4" r="4"/>
                                <path d="M22 18v-2a4 4 0 0 0-3-3.87M15 .13a4 4 0 0 1 0 7.75"/>
                            </g>
                        </svg>
                    </CAvatar>
                    <div class="conversationName">
                        <span class="name">
                        {{ item.name }}
                        </span>
                        <span class="number">{{item.users.length > 1 ? item.users.length + ' persons' : item.users.length + ' person'}} </span>
                    </div>
                </div>
                <i class="setting" @click="showModal(item.id)" >
                    <svg aria-hidden="true" role="img" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                              d="M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"></path>
                    </svg>
                </i>
                <i class="close" @click="closeConversation(item.id)">
                    <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                    </svg>
                </i>
            </div>
            <div v-if="item.hasNewMessages" class="new-messages">!</div>
        </div>
    </div>
    <div class="bottom-sidebar description">
        <div>
            <CAvatar text-color="white" color="dark" status="success">{{ user.username[0] }}</CAvatar>
            <span class="name">
            {{ user.username }}
            </span>
        </div>
    </div>
    <!--<Modal
            v-if="initialVisibleModal"-->
    <Modal
            :initialVisibleModal="initialVisibleModal"
            :initialHeaderTitle="'Conversation setting'"
            @showHidenModal="showHidenModal"
            @submitModal="submitModal">
        <template v-slot:bodySlot>
            <div class="form-group">
                <label >Conversation name:</label>
                <input name="conversationName" ref="roomName" type="text" class="form-control" placeholder="Conversation name" v-model="roomName"/>
            </div>
            <div class="form-group">
                <label >List user in room:</label>
                <ListUser v-key="modalId" :initialUsers="listUser" :positionTooltip="top"/>
            </div>
        </template>
    </Modal>
</template>
<!--            <CAvatar color="secondary" status="danger">{{ user.username[0] }}</CAvatar>-->
<!--            <CAvatar color="primary" status="warning">{{ user.username[0] }}</CAvatar>-->
<script>
    import { CAvatar, CModal, CModalHeader, CModalTitle, CModalBody, CButton, CTooltip } from '@coreui/vue';
    import StatusIcon from "./Icon";
    import '@coreui/coreui/dist/css/coreui.min.css'
    import Modal from "./modal";
    import ListUser from "./ListUser";
    export default {
        components: {
            ListUser,
            Modal, StatusIcon, CAvatar, CModal, CModalHeader, CModalTitle, CModalBody, CButton, CTooltip },
        props: {
            initialUser: Object,
            initialRooms: Object
        },
        emits: ['changeRoom'],
        data() {
            return {
                initialVisibleModal: false,
                user: this.initialUser,
                rooms: this.initialRooms,
                roomName: '',
                listUser: [],
                modalId: '',
                currentRoom: ''
            }
        },
        watch: {
        },
        methods: {
            onClick(item) {
                this.currentRoom = item.id
                this.$emit("changeRoom", this.rooms[this.currentRoom]);
            },
            closeConversation(id) {

            },
            showModal(id) {
                this.listUser = []
                let room = this.rooms[id]
                for (let i in room.users) {
                    this.listUser[room.users[i]] = this.$store.state.users[room.users[i]]
                }
                this.modalId = id
                this.roomName = room.name
                this.initialVisibleModal = true
            },
            showHidenModal(data) {
                this.initialVisibleModal = false
            },
            submitModal() {
                console.log(this.user, this.rooms, this.currentRoom, this.$store.state)
                console.log(this.roomName)
            }
        },
        created() {
            // console.log(this.user, this.rooms, this.currentRoom, this.$store.state)
            let socket = this.$soketio
        }
    }
</script>