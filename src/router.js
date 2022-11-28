import { createRouter, createWebHistory } from 'vue-router'

import Chat from './components/Chat.vue'
import Login from './components/Login.vue'
import Signup from './components/Signup.vue'
import Error from './components/Error.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: Chat
    },
    {
        path: '/signup',
        name: 'signup',
        component: Signup
    },
    {
        path: '/Login',
        name: 'login',
        component: Login
    },
    {
        path: '/:catchAll(.*)',
        component: Error
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

export default router