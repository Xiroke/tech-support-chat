import {createRouter, createWebHistory} from "vue-router";
import Login from "./pages/Login.vue";
import LoginAdmin from "./pages/LoginAdmin.vue";
import Dashboard from "./pages/Dashboard.vue";
import Chat from "./pages/Chat.vue";

// маршруты
export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: '/', component: Login, name: 'Login'},
        {path: '/admin/login', component: LoginAdmin, name: 'LoginAdmin'},
        {path: '/admin/dashboard', component: Dashboard, name: 'Dashboard'},
        {path: '/admin/chats/:chat_id', component: Chat, name: 'ChatAdmin'},
        {path: '/chats/:chat_id', component: Chat, name: 'Chat'},
    ]
})