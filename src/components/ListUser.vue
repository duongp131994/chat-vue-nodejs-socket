<template>
    <div class="list_user">
        <CTooltip v-for="(user, index) in users" :key="index" :id-room="index" :content="user.username" placement="top">
            <template #toggler="{ on }">
                <CButton color="secondary avatar_tooltip" v-on="on">
                    <CAvatar text-color="white" color="dark" :status="user.connected ? 'success' : 'danger'">{{ user.username[0] }}</CAvatar>
                </CButton>
            </template>
        </CTooltip>
    </div>
</template>

<script>
    import {CButton, CTooltip, CAvatar} from '@coreui/vue';
    import '@coreui/coreui/dist/css/coreui.min.css'
    export default {
        name: "ListUser",
        components: {CButton, CTooltip, CAvatar},
        props: {
            initialUsers: Object,
            positionTooltip: String,
        },
        emits: ['changeRoom'],
        data() {
            return {
                positionTooltip: this.positionTooltip,
            }
        },
        computed: {
            users: function() {
                let users = []
                for (let index in this.initialUsers) {
                    if (!this.initialUsers[index]) {
                        continue
                    }
                    users.push(this.initialUsers[index])
                }
                return users
            }
        },
        mounted() {
            console.log(this.initialUsers)
        }
    }
</script>

<style scoped>

</style>