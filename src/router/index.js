import { createRouter, createWebHistory } from "vue-router"
import { chatRouter } from './chatRouter';
import GoogleRedirect from "@/components/GoogleRedirect.vue";
import KakaoRedirect from "@/components/KakaoRedirect.vue";
import { userRouter } from "./userRouter";
import { gatheringRouter } from "./gatheringRouter";
import PostDetail from '@/components/PostDetail.vue'
import VoteDetail from '@/components/VoteDetail.vue'
import FreePostCreate from '@/views/FreePostCreate.vue'
import NoticePostCreate from '@/views/NoticePostCreate.vue'
import VotePostCreate from '@/views/VotePostCreate.vue'
import { adminRouter } from "./adminRouter";
const routes = [
    ...chatRouter,
    ...userRouter,
    ...gatheringRouter,
    ...adminRouter,
    
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
    },
    {
        path: '/silverpotion/vote/:voteId',
        name: 'VoteDetail',
        component: VoteDetail,
        props: true
    },
    {
        path: '/silverpotion/post/vote/detail/:voteId',
        name: 'VoteDetailAlt',
        component: VoteDetail,
        props: true
    },
    {
        path: '/silverpotion/post/create/free',
        name: 'FreePostCreate',
        component: FreePostCreate,
        props: true
    },
    {
        path: '/silverpotion/post/create/notice',
        name: 'NoticePostCreate',
        component: NoticePostCreate,
        props: true
    },
    {
        path: '/silverpotion/post/create/vote',
        name: 'VotePostCreate',
        component: VotePostCreate,
        props: true
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Navigation guard to protect admin routes
router.beforeEach((to, from, next) => {
    if (to.path.startsWith('/silverpotion/admin')) {
        const role = localStorage.getItem('role');
        if (role !== 'ADMIN') {
            next('/silverpotion/admins');
            return;
        }
    }
    next();
});

export default router;