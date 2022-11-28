import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/font-awesome.min.css'
import './styles/style.css'

createApp(App).use(router).mount('#app')
