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
                                    <span class="text-truncate message-content">{{ chat.lastMessageContent || '메시지가 없습니다.' }}</span>
                                    <v-badge
                                        v-if="chat.unreadCount > 0"
                                        :content="chat.unreadCount"
                                        color="error"
                                        class="unread-badge ml-2"
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
import emitter from '@/event-bus';

export default {
    data() {
        return {
            chatRoomList: [],
            showCreateRoomModal: false,
            newRoomTitle: "",
            token: localStorage.getItem("token"),
            senderLoginId: localStorage.getItem("loginId"),
            unreadCount: 0,
            roomId: null,
        }
    },
    created() {
        this.loadChatRooms();
        emitter.on("newMessageReceived", this.updateChatRoom);
    },
    beforeRouteLeave(to, from, next) {
        next();
    },
    beforeUnmount() {
        emitter.off("newMessageReceived", this.updateChatRoom); // 정리
    },
    beforeRouteUpdate(to, from, next) {
        this.messages = [];
        this.page = 0;
        this.hasMore = true;

        this.loadMessageHistory();
        
        this.markAsRead();

        next();
    },
    methods: {
        updateChatRoom( message) {
            const roomId = message.roomId;
            console.log(message)
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
    padding: 16px !important;
    border-bottom: 1px solid #f0f0f0;
}

.chat-list-item:hover {
    background-color: #f8f9fa;
}

.message-content {
    max-width: calc(100% - 40px) !important; /* 뱃지 공간 확보 */
    margin-right: 8px !important;
}

.unread-badge .v-badge__badge {
    font-size: 0.9rem;
    min-width: 24px;
    height: 24px;
    padding: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #4FC3F7 !important; /* 하늘색 포인트 */
}

.v-list-item-title {
    font-size: 1.2rem !important;
    font-weight: 600 !important;
    color: #333 !important;
    margin-bottom: 4px !important;
}

.v-list-item-subtitle {
    font-size: 1rem !important;
    color: #666 !important;
    line-height: 1.4 !important;
    padding-right: 8px !important;
}

/* 카드 스타일 수정 */
.v-card {
    border-radius: 12px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.v-card-title {
    font-size: 1.4rem !important;
    font-weight: 600 !important;
    color: #333 !important;
    padding: 20px !important;
    border-bottom: 2px solid #4FC3F7 !important; /* 하늘색 포인트 */
}

/* 시간 표시 스타일 */
.text-caption {
    font-size: 0.9rem !important;
    color: #666 !important;
}

/* 아바타 스타일 */
.v-avatar {
    background-color: #4FC3F7 !important; /* 하늘색 포인트 */
}

.v-icon {
    color: white !important;
}
</style>