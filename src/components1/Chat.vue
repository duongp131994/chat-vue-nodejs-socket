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
import socket from "../socket";
import User from "./User";
import MessagePanel from "./MessagePanel";

export default {
  name: "Chat",
  components: { User, MessagePanel },
  data() {
    return {
      selectedUser: null,
      users: [],
      userIds: [],
    };
  },
  methods: {
    onMessage(content) {
      if (this.selectedUser) {
        console.log(this.selectedUser, content)
        socket.emit("private message", {
          content,
          to: this.selectedUser.userId,
        });
        this.selectedUser.messages.push({
          content,
          fromSelf: true,
        });
      }
    },
    onSelectUser(user) {
      this.selectedUser = user;
      user.hasNewMessages = false;
    },
  },
  created() {
    socket.on("connect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = true;
        }
      });
    });

    socket.on("disconnect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = false;
        }
      });
    });

    const initReactiveProperties = (user) => {
      user.messages = [];
      user.hasNewMessages = false;
    };

    //duoc thong bao list user khi co user connect
    socket.on("list-users", async (users) => {
      users.forEach((user) => {
        console.log(socket.userId)
        user.self = user.userId === socket.userId;
        initReactiveProperties(user);
        this.users[user.userId] = user
      });
      this.userIds = await Object.keys(this.users)
      this.userIds = await this.userIds.sort((a, b) => {
        if (this.users[a].self) return -1;
        if (this.users[b].self) return 1;
        if (this.users[a].date < this.users[b].date) return -1;
        return this.users[a].date > this.users[b].date ? 1 : 0;
      });
    });

    //tuong tu tren nhung chi nhan user moi connect
    socket.on("user connected", (user) => {
      if (this.users[user.userId]) {
        this.users[user.userId].connected = true
        this.users[user.userId].date = user.date
        return;
      }
      initReactiveProperties(user);
      this.users[user.userId] = user;
      this.userIds.push(user.userId);
    });

    //khi co 1 user dis
    socket.on("user disconnected", (id) => {
      this.users[id].connected = false;
      // for (let i = 0; i < this.users.length; i++) {
      //   const user = this.users[i];
      //   if (user.userId === id) {
      //     user.connected = false;
      //     break;
      //   }
      // }
    });

    socket.on("private message", ({ content, from, to }) => {
      console.log(this.userIds)
      for (let id in this.userIds) {
        const user = this.users[this.userIds[id]];
        const fromSelf = socket.userId === from;
        console.log(user)

        if (user.userId === (fromSelf ? to : from)) {
          user.messages.push({
            content,
            fromSelf
          });
          if (user !== this.selectedUser) {
            user.hasNewMessages = true;
          }
          break;
        }
      }
    });
  },
  destroyed() {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("users");
    socket.off("user connected");
    socket.off("user disconnected");
    socket.off("private message");
  },
};
</script>

<style scoped>
.left-panel {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  overflow-x: hidden;
  background-color: #3f0e40;
  color: white;
}

.right-panel {
  margin-left: 260px;
}
</style>
