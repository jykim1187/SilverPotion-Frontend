<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title class="text-center text-h5">
                        채팅방목록
                    </v-card-title>
                    <v-card-text>
                        <v-list>
                            <v-list-item
                                v-for="chat in chatRoomList"
                                :key="`${chat.id}-${chat.lastMessageTime}`"
                                @click="joinChatRoom(chat.id)"
                                class="chat-list-item"
                            >
                                <template v-slot:prepend>
                                    <v-avatar color="primary">
                                        <v-icon icon="mdi-account"></v-icon>
                                    </v-avatar>
                                </template>

                                <v-list-item-title class="d-flex justify-space-between">
                                    <span class="font-weight-bold">{{ chat.title }}</span>
                                    <span class="text-caption text-medium-emphasis">{{ formatTime(chat.lastMessageTime) }}</span>
                                </v-list-item-title>

                                <v-list-item-subtitle class="d-flex justify-space-between align-center">
                                    <span class="text-truncate">{{ chat.lastMessageContent || '메시지가 없습니다.' }}</span>
                                    <v-badge
                                        v-if="chat.unreadCount > 0"
                                        :content="chat.unreadCount"
                                        color="error"
                                        class="unread-badge"
                                    ></v-badge>
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-dialog v-model="showCreateRoomModal" max-width="500px">
        </v-dialog>

    </v-container>
</template>

<script>
import axios from 'axios';
import WebSocketManager from '@/WebSocketManager';

export default {
    data() {
        return {
            chatRoomList: [],
            showCreateRoomModal: false,
            newRoomTitle: "",
            token: localStorage.getItem("token"),
            senderLoginId: localStorage.getItem("loginId"),
            unreadCount: 0,
        }
    },
    created() {
    this.loadChatRooms();
    this.chatRoomList.sort((a, b) => {
        const timeA = new Date(a.lastMessageTime || a.createdAt);
        const timeB = new Date(b.lastMessageTime || b.createdAt);
        return timeB - timeA;
    });

    const loginId = localStorage.getItem("loginId");
    const topic = `/user/${loginId}/chat`;

    WebSocketManager.replaceSubscribe(topic, (parsed) => {
        console.log('📨 리스트용 메시지 수신:', parsed);

        // 메시지에서 roomId 추출
        if (parsed && parsed.roomId) {
        this.updateChatRoom(parsed.roomId, parsed);
        }
    });
    },
    beforeRouteLeave(to, from, next) {
        // this.disconnectWebSocket();
        next();
    },
    beforeUnmount() {
        this.disconnectWebSocket();
    },
    beforeRouteUpdate(to, from, next) {
        this.roomId = to.params.roomId;
        this.messages = [];
        this.page = 0;
        this.hasMore = true;

        this.loadMessageHistory();
        this.markAsRead();
        this.disconnectWebSocket();
        this.connectWebsocket();

        next();
    },
    methods: {
        
        updateChatRoom(roomId, message) {
            console.log('🔄 updateChatRoom called with:', { roomId, message });
            const roomIndex = this.chatRoomList.findIndex(room => room.id == roomId);
            console.log('Found room index:', roomIndex);

            const isCurrentRoom = this.isCurrentChatRoom(roomId);

            if (roomIndex !== -1) {
                const room = this.chatRoomList[roomIndex];
                const updatedUnreadCount = isCurrentRoom ? 0 : (room.unreadCount || 0) + 1;

                this.chatRoomList[roomIndex] = {
                    ...room,
                    lastMessageContent: message.content,
                    lastMessageTime: message.createdAt || new Date().toISOString(),
                    unreadCount: updatedUnreadCount,
                };
            } else {
                // 🆕 새 채팅방일 경우
                this.chatRoomList.push({
                    id: roomId,
                    title: message.senderNickName || '새 채팅방', // 기본 타이틀
                    lastMessageContent: message.content,
                    lastMessageTime: message.createdAt || new Date().toISOString(),
                    unreadCount: 1, // ✅ 처음 오면 읽지 않은 메시지 1개
                });
            }

            // 리스트 정렬 (최신순)
            this.chatRoomList.sort((a, b) => {
                const timeA = new Date(a.lastMessageTime || a.createdAt);
                const timeB = new Date(b.lastMessageTime || b.createdAt);
                return timeB - timeA;
            });

            console.log('✅ 채팅방 리스트 실시간 갱신됨:', this.chatRoomList);
        },
        isCurrentChatRoom(roomId) {
            return this.$route.path === `/chat/${roomId}`;
        },
        disconnectWebSocket() {
            const topic = `/user/${this.senderLoginId}/chat`;
            WebSocketManager.unsubscribe(topic);
        },
        async loadChatRooms() {
            try {
                const response = await axios.get(
                    `${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/rooms`,
                    {
                        params: {
                            userId: localStorage.getItem("userId")
                        },
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            "X-User-LoginId": localStorage.getItem("loginId")
                        }
                    }
                );
                console.log('Chat rooms response:', response.data);
                this.chatRoomList = response.data;
                // 안 읽은 메시지 수 추가
                const withUnread = await Promise.all(this.chatRoomList.map(async (room) => {
                    try {
                        const res = await axios.get(
                            `${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/room/${room.id}/unread-count`,
                            {
                                params: { userId: localStorage.getItem("userId") },
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                    "X-User-LoginId": localStorage.getItem("loginId")
                                }
                            }
                        );
                        return { ...room, unreadCount: res.data };
                    } catch {
                        return { ...room, unreadCount: 0 }; // 실패 시 0으로 처리
                    }
                }));
                this.chatRoomList = withUnread;
                console.log('📥 채팅방 + 안 읽은 메시지 수:', withUnread);
            } catch (error) {
                console.error("❌ 채팅방 목록 불러오기 실패", error);
                alert("채팅방 목록을 불러오지 못했습니다.");
            }
        },
        
        async joinChatRoom(roomId) {
            try {
                this.$router.push(`/chat/${roomId}`);
            } catch (error) {
                console.error("❌ 채팅방 참여 실패", error);
                alert("채팅방 참여 중 오류가 발생했습니다.");
            }
        },
        
        formatTime(datetime) {
            if (!datetime) return '';
            const date = new Date(datetime);
            const now = new Date();
            const diff = now - date;
            
            // 오늘인 경우 시간만 표시
            if (diff < 24 * 60 * 60 * 1000) {
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            }
            
            // 이번 주인 경우 요일 표시
            if (diff < 7 * 24 * 60 * 60 * 1000) {
                const days = ['일', '월', '화', '수', '목', '금', '토'];
                return days[date.getDay()];
            }
            
            // 그 외의 경우 날짜 표시
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${month}/${day}`;
        }
    }
}
</script>

<style scoped>
.chat-list-item {
    cursor: pointer;
    transition: background-color 0.2s;
}

.chat-list-item:hover {
    background-color: #f5f5f5;
}

.unread-badge .v-badge__badge {
    font-size: 0.7rem;
    min-width: 20px;
    height: 20px;
    padding: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.v-list-item-title {
    font-size: 1rem;
}

.v-list-item-subtitle {
    font-size: 0.875rem;
    color: #666;
}
</style>