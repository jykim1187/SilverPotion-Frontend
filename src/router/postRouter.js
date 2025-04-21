import PostListAll from "@/views/post/PostListAll.vue";
import PostListFree from "@/views/post/PostListFree.vue";
import PostListNotice from "@/views/post/PostListNotice.vue";
import PostListVote from "@/views/post/PostListVote.vue";
import PostDetail from "@/views/post/PostDetail.vue";

export const postRouter = [
    {
        path:'/silverpotion/post/list',
        name: 'PostListAll',
        component: PostListAll
    },
    {
        path:'/silverpotion/post/free/list',
        name: 'PostListFree',       
        component: PostListFree
    },
    {
        path:'/silverpotion/post/notice/list',
        name: 'PostListNotice',
        component: PostListNotice
    },
    {
        path:'/silverpotion/post/vote/list',
        name: 'PostListVote',
        component: PostListVote
    },
    {
        path:'/silverpotion/post/detail/:id',
        name: 'PostDetail',
        component: PostDetail,
        props: true
    },
    {
        path:'/silverpotion/post/:id/likes',
        name: 'PostLikes',
        component: () => import('@/views/post/PostLikes.vue')
    }
];