<template>
    <div>
        <div class="left-panel">
            <user
                    v-for="userId in userIds"
                    :key="userId"
                    :user="users[userId]"
                    :selected="selectedUser === users[userId]"
                    @select="onSelectUser(users[userId])"
            />
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
    export default {
        data() {
            return {}
        }
    }
</script>