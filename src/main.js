import { createApp } from 'vue'
import router from './router'
import { createStore } from 'vuex'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/font-awesome.min.css'
import './styles/style.css'

import socket from "./socket";
const app =  createApp(App);
app.config.globalProperties.$soketio = socket;

const store = createStore({
    state () {
        return {
            user: {},
            users: {},
            conversionContents: {},
            rooms: {}
        }
    },
    mutations: {
        replace (state, param) {
            state[param[0]] = param[1]
        },
        update (state, param) {
            Object.assign(state[param[0]], param[1]);
        }
    }
})

app.use(router).use(store).mount('#app')
