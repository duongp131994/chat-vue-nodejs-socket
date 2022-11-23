<template>
  <div class="select-username">
    <form @submit.prevent="onSubmit">
      <input :value="username" placeholder="Your username..." @input="changeInput" />
      <button :disabled="!isValid">Send</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "SelectUsername",
  data() {
    return {
      username: "",
    };
  },
  computed: {
    isValid() {
      return this.username.length > 2;
    },
  },
  emits: ['input1'],
  methods: {
    changeInput(e) {
      this.username = e.target.value
      console.log(this.username)
      if (e.key === "Enter") {
        this.$emit("input1", this.username);
      }
    },
    onSubmit() {
      console.log(this.username)
      this.$emit("input1", this.username);
    },
  },
};
</script>

<style scoped>
.select-username {
  width: 300px;
  margin: 200px auto 0;
}
</style>
