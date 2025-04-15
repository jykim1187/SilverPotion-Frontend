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
                                :key="chat.id"
                                @click="joinChatRoom(chat.id)"
                                class="chat-list-item"
                            >
                                <template v-slot:prepend>
                                    <v-avatar color="primary">
                                        <v-icon icon="mdi-account"></v-icon>
                                    </v-avatar>
                                </template>

                                <v-list-item-title class="d-flex justify-space-between">
                                    <span class="font-weight-bold">{{ chat.otherUserNickname }}</span>
                                    <span class="text-caption text-medium-emphasis">{{ formatTime(chat.lastMessageTime) }}</span>
                                </v-list-item-title>

                                <v-list-item-subtitle class="d-flex justify-space-between align-center">
                                    <span class="text-truncate">{{ chat.lastMessage }}</span>
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

export default {
    data() {
        return {
            chatRoomList: [],
            showCreateRoomModal: false,
            newRoomTitle: "",
        }
    },
    async created() {
        this.loadChatRooms();
    },
    methods: {
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
                this.chatRoomList = response.data;
            } catch (error) {
                console.error("❌ 채팅방 목록 불러오기 실패", error);
                alert("채팅방 목록을 불러오지 못했습니다.");
            }
        },
        async joinChatRoom(roomId) {
            try {
                // 메시지 읽음 처리
                await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/room/${roomId}/read`,
                    null,
                    {
                        params: {
                            userId: localStorage.getItem("userId"),
                            messageId: 0
                        },
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            "X-User-LoginId": localStorage.getItem("loginId")
                        }
                    }
                );
                this.$router.push(`/chat/${roomId}`);
            } catch (error) {
                console.error("❌ 채팅방 참여 실패", error);
                alert("채팅방 참여 중 오류가 발생했습니다.");
            }
        },
        async createChatRoom() {
            const loginId = localStorage.getItem("loginId");
            await axios.post(
                `${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/room/group/create?roomName=${this.newRoomTitle}`,
                null,
                {
                    headers: {
                        "X-User-LoginId": loginId // ✅ 헤더에 추가
                    }
                }
            );
            this.showCreateRoomModal = false;
            this.loadChatRooms();
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

.unread-badge {
    margin-left: 8px;
}

.v-list-item-title {
    font-size: 1rem;
}

.v-list-item-subtitle {
    font-size: 0.875rem;
    color: #666;
}
</style>