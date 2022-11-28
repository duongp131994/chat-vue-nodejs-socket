import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/font-awesome.min.css'
import './styles/style.css'

import socket from "./socket";
const app =  createApp(App);
app.config.globalProperties.$soketio = socket;

app.use(router).mount('#app')
