<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" md="8">
                <v-card>
                    <v-card-title class="text-center text-h5">
                        채팅
                    </v-card-title>
                    <v-card-text>
                        <div class="chat-box">
                            <div 
                                v-for="(msg, index) in messages"
                                :key="index"
                                :class="['chat-message', isMine(msg.senderId) ? 'sent' : 'received']"
                                >
                                <div class="message-content">
                                    <template v-if="!isMine(msg.senderId)">
                                    <div class="sender-info">{{ msg.senderNickName }}</div>
                                    </template>
                                    <span>{{ msg.isDeleted ? '삭제된 메시지입니다.' : msg.content }}</span>
                                    <span class="time" v-if="msg.createdAt">{{ formatTime(msg.createdAt) }}</span>
                                </div>
                            </div>
                        </div>
                        <v-text-field
                            v-model="newMessage"
                            label="메시지 입력"
                            @keyup.enter="sendMessage"
                        />
                        <v-btn color="primary" block @click="sendMessage">전송</v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import WebSocketManager from '@/WebSocketManager';
import emitter from '@/event-bus';

export default {
    data() {
        return {
            messages: [],
            newMessage: "",
            userId: null,
            roomId: null,
            token: localStorage.getItem("token"),
            senderLoginId: localStorage.getItem("loginId"),
            isSending: false, 
            page: 0, // ✅ 현재 페이지
            hasMore: true, // ✅ 더 불러올 메시지가 있는지 여부
            loadingHistory: false, // ✅ 중복 로딩 방지
        }
    },
    async created() {
        console.log("🔥 채팅방 created() 실행됨");
        this.roomId = this.$route.params.roomId;
        this.userId = localStorage.getItem("userId");
        this.messages = [];
        this.page = 0;
        this.hasMore = true;
        await this.loadMessageHistory();
        this.markAsRead();

    },
    mounted() {
        emitter.on("newMessageReceived", this.onMessageReceived);
        const chatBox = this.$el.querySelector(".chat-box");
        chatBox.addEventListener("scroll", this.onScrollTop);
    },
    beforeRouteLeave: async function (to, from, next) {
        try {
            if (this.messages.length && this.messages[this.messages.length - 1]?.id) {
            await this.markAsRead();
            }
        } catch (err) {
            console.error('❌ 읽음 처리 실패:', err);
        }
        next();
    },
    beforeUnmount() {
        const chatBox = this.$el.querySelector(".chat-box");
        chatBox.removeEventListener("scroll", this.onScrollTop);
        emitter.off("newMessageReceived", this.onMessageReceived);
    },
    beforeRouteUpdate(to, from, next) {
    this.roomId = to.params.roomId;  // 새로운 roomId 업데이트
    this.messages = [];  // 기존 메시지 비우기
    this.page = 0;  // 새로 시작할 페이지
    this.hasMore = true;  // 더 불러올 메시지 여부 초기화

    // 채팅 히스토리 로드
    this.loadMessageHistory();
    next();  // 라우트 이동 계속
    },
    methods: {
    onMessageReceived(message) {
        const roomMatch = parseInt(message.roomId) === parseInt(this.roomId);
        const notMine = String(message.senderId) !== String(this.userId);

        if (roomMatch && notMine) {
            this.messages.push(message);
            this.scrollToBottom();
        }
    },
    isMine(senderId) {
        return String(senderId) === String(this.userId);
    },

    onScrollTop(e) {
        const el = e.target;
        if (el.scrollTop < 50 && this.hasMore && !this.loadingHistory) {
            this.page++;
            this.loadMessageHistory();
        }
    },

    async loadMessageHistory() {
        this.loadingHistory = true;
        try {
            const response = await fetch(
                `${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/${this.roomId}/messages?page=${this.page}&size=30`,
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        "X-User-LoginId": this.senderLoginId
                    }
                }
            );

            const result = await response.json();
            const reversed = result.content.reverse(); // 오래된 메시지가 위로 오도록

            if (reversed.length === 0) {
                this.hasMore = false;
                return;
            }

            const chatBox = this.$el.querySelector(".chat-box");
            const oldScrollHeight = chatBox.scrollHeight;

            this.messages = [...reversed, ...this.messages]; // 위로 붙이기

            this.$nextTick(() => {
                const newScrollHeight = chatBox.scrollHeight;
                chatBox.scrollTop = newScrollHeight - oldScrollHeight; // 스크롤 위치 유지
            });

            console.log(`📄 page ${this.page} 히스토리 불러옴`, reversed.length);
        } catch (error) {
            console.error("❌ 채팅 히스토리 불러오기 실패", error);
        } finally {
            this.loadingHistory = false;
        }
    },
        sendMessage() {
        if (this.newMessage.trim() === "") return;
        this.isSending = true; // 전송 중 플래그 설정

        const message = {
            roomId: this.roomId,
            content: this.newMessage,
            type: "TEXT",
            senderId: this.userId,
            senderNickName: localStorage.getItem("nickName"),
            createdAt: new Date().toISOString() // ISO 8601 형식으로 시간 생성
        };

        console.log('📤 Sending message:', message);

        // 메시지를 먼저 로컬에 추가
        this.messages.push(message);
        this.scrollToBottom();

        // WebSocket으로 메시지 전송
        WebSocketManager.send(
            `/pub/room/${this.roomId}`,
            message
        );

        this.newMessage = ""; // 메시지 입력 초기화
        this.isSending = false; // 전송 완료 후 상태 초기화
        },

    scrollToBottom() {
        this.$nextTick(() => {
            const chatBox = this.$el.querySelector(".chat-box");
            chatBox.scrollTop = chatBox.scrollHeight;
        });
    },

    formatTime(datetime) {
        if (!datetime) return '';
        const date = new Date(datetime);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    },

    // ✅ 나가기 전에 읽음 처리
    async markAsRead() {
        if (!this.messages.length) return;

        const lastMessage = this.messages[this.messages.length - 1];
        const userId = localStorage.getItem("userId");


        try {
            await fetch(`${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/room/${this.roomId}/read?userId=${userId}&messageId=${lastMessage.id}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "X-User-LoginId": this.senderLoginId
                }
            });
            console.log('📍 메시지 읽음 처리 완료');
        } catch (error) {
            console.error('❌ 메시지 읽음 처리 실패', error);
        }
    },

    // disconnectWebSocket() {
    //     const topic = `/user/${this.senderLoginId}/chat`;
    //     console.log("🛑 disconnectWebSocket 호출됨 → topic:", topic);
    //     WebSocketManager.unsubscribe(topic);
    //     this.isSubscribed = false;
    // },
}
}
</script>

<style>
.chat-box {
    height: 500px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    margin-bottom: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: #fff;
    border-radius: 12px;
}

.chat-message {
    display: flex;
    flex-direction: column;
    max-width: 85%;
    word-wrap: break-word;
}

.sent {
    align-self: flex-end;
}

.received {
    align-self: flex-start;
}

.message-content {
    padding: 12px 16px;
    border-radius: 16px;
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 12px;
    font-size: 1.1rem;
    line-height: 1.5;
}

.sent .message-content {
    background-color: #4FC3F7;
    color: white;
    border-bottom-right-radius: 4px;
}

.received .message-content {
    background-color: #f8f9fa;
    color: #333;
    border-bottom-left-radius: 4px;
    border: 1px solid #e0e0e0;
}

.sender-info {
    font-weight: 600;
    margin-bottom: 6px;
    font-size: 1rem;
    color: #4FC3F7;
}

.message-with-time {
    display: flex;
    align-items: flex-end;
    gap: 12px;
}

.message-text {
    margin: 4px 0;
    flex: 1;
}

.time {
    font-size: 0.9rem;
    color: #888;
    display: inline-block;
    white-space: nowrap;
    margin-left: 8px;
}

/* 카드 스타일 수정 */
.v-card {
    border-radius: 16px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.v-card-title {
    font-size: 1.5rem !important;
    font-weight: 600 !important;
    color: #333 !important;
    padding: 24px !important;
    border-bottom: 2px solid #4FC3F7 !important;
}

/* 입력 필드 스타일 */
.v-text-field {
    margin-bottom: 16px !important;
}

.v-text-field :deep(.v-field__input) {
    font-size: 1.1rem !important;
    padding: 12px !important;
}

/* 전송 버튼 스타일 */
.v-btn {
    font-size: 1.1rem !important;
    font-weight: 500 !important;
    padding: 12px !important;
    background-color: #4FC3F7 !important;
    color: white !important;
    border-radius: 8px !important;
    text-transform: none !important;
    letter-spacing: 0.5px !important;
}

.v-btn:hover {
    background-color: #81D4FA !important;
}

/* 반응형 스타일 */
@media (max-width: 600px) {
    .chat-box {
        height: 450px;
        padding: 16px;
    }
    
    .chat-message {
        max-width: 90%;
    }
    
    .message-content {
        padding: 10px 14px;
        font-size: 1rem;
    }
    
    .sender-info {
        font-size: 0.95rem;
    }
    
    .time {
        font-size: 0.85rem;
    }
}
</style>