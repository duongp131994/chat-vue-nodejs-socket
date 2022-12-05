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

const checkNested = function (obj, [level,  ...rest]) {
    if (obj === undefined) return false
    if (rest.length == 0 && obj.hasOwnProperty(level)) return true
    return checkNested(obj[level], ...rest)
}

const getNested = function (obj, [...args]) {
    return args.reduce((obj, level) => obj && obj[level], obj)
}

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
            if (param[0].length > 0) {
                let childState = getNested(state, param[0])
                if (!childState) {
                    childState = getNested(state, param[0].slice(0, -1))
                    childState[param[0].slice(-1)[0]] = param[1]
                } else {
                    Object.assign(childState, param[1]);
                }
            }
        }
    }
})

app.use(router).use(store).mount('#app')
