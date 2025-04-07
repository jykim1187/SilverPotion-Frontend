
import StompChatPage from "@/views/ChatRoom/StompChatPage.vue";
import GroupChattingList from "@/views/ChatRoom/GroupChattingList.vue";

export const chatRouter= [
    {
        path:'/chat-service/chat/my/rooms',
        name:'GroupChattingList',
        component: GroupChattingList
    },
    {
        path:'/chatpage/:roomId',
        name: 'StompChatPage',
        component: StompChatPage
    },
]