import { createRouter, createWebHistory } from "vue-router"
import { chatRouter } from './chatRouter';
import GoogleRedirect from "@/components/GoogleRedirect.vue";
import KakaoRedirect from "@/components/KakaoRedirect.vue";
import { userRouter } from "./userRouter";
import { gatheringRouter } from "./gatheringRouter";
import PostDetail from '@/components/PostDetail.vue'

const routes = [
    ...chatRouter,
    ...userRouter,
    ...gatheringRouter,
    
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
    {
        path: '/silverpotion/post/detail/:postId',
        name: 'PostDetail',
        component: PostDetail,
        props: true
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;