

import ChatRoom from "@/views/ChatRoom/ChatRoom.vue";
import GroupChatList from "@/views/ChatRoom/GroupChatList.vue";

export const chatRouter= [
    {
        path:'/chat-service/chat/my/rooms',
        name:'GroupChatList',
        component: GroupChatList
    },
    {
        path:'/chat/:roomId',
        name: 'ChatRoom',
        component: ChatRoom
    },
]