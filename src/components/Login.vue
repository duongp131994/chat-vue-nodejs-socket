<template>
    <div class="vue-tempalte login-form">
        <form>
            <h3>Sign In</h3>
            <div class="form-group">
                <label>Email address</label>
                <input type="email" class="form-control form-control-lg" />
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" class="form-control form-control-lg" />
            </div>
            <button type="submit" class="btn btn-dark btn-lg btn-block">Sign In</button>
        </form>
    </div>
</template>
<script>
    export default {
        data() {
            return {}
        },
        methods: {
            onUsernameSelection() {

            },
            onLogOut() {
                router.push({ name: 'login'})
            }
        },
        created() {
            const userId = localStorage.getItem("chatuserId");
            const userPass = localStorage.getItem("chatuserPass");
            if (userId && userPass) {
                // socket.auth = {userId};
                // console.log(userId)
                //
                // socket.connect();
            }
        },
        destroyed() {
            socket.off("connect_error");
        }
    }
</script>