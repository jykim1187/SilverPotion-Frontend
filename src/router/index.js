import { createRouter, createWebHistory } from "vue-router"
import UserCreate from "@/views/UserCreate.vue"
import LoginPage from "@/views/LoginPage.vue";
import MainHome from "@/views/MainHome.vue";
import UserList from "@/views/UserList.vue";
import { chatRouter } from './chatRouter';
import GoogleRedirect from "@/components/GoogleRedirect.vue";
import KakaoRedirect from "@/components/KakaoRedirect.vue";

const routes = [
    ...chatRouter,
    {
        path:'/',
        name: 'MainHome',
        component: MainHome
    },
    {
        path:'/user-service/silverpotion/user/create',
        name: 'UserCreate',
        component: UserCreate
    },
    {
        path:'/user-service/silverpotion/user/login',
        name: 'LoginPage',
        component: LoginPage
    },
    
    {
        path:'/user-service/silverpotion/user/list',
        name: 'UserList',
        component: UserList
    },
    {
        path: '/oauth/google/redirect',
        name: 'GoogleRedirect',
        component: GoogleRedirect
    },
    {
        path: '/oauth/kakao/redirect',
        name: 'KakaoRedirect',
        component: KakaoRedirect
    },
    
    // {
    //     path:'/simple/chat',
    //     name: 'SimpleWebsocket',
    //     component: SimpleWebsocket
    // },
    // {
    //     path:'/groupchatting/list',
    //     name: 'GroupChattingList',
    //     component: GroupChattingList
    // },
    // {
    //     path:'/my/chat/page',
    //     name: 'MyChatPage',
    //     component: MyChatPage
    // }

]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;