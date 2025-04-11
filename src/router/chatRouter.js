

import ChatBox from "@/views/ChatRoom/ChatBox.vue";
import ChatList from "@/views/ChatRoom/ChatList.vue";

export const chatRouter= [
    {
        path:'/chat-service/chat/my/rooms',
        name:'GroupChatList',
        component: ChatList
    },
    {
        path:'/chat/:roomId',
        name: 'ChatBox',
        component: ChatBox
    },
]