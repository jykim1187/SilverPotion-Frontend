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
            isSubscribed: false,
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
    beforeRouteLeave(to, from, next) {
        this.markAsRead(); // ✅ 나가기 전에 읽음 처리
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

    connectWebsocket() {
        if (this.isSubscribed) {
            console.log("🚫 이미 구독 중 → 중단");
            return;
        }

        const loginId = localStorage.getItem("loginId");
        const topic = `/user/${loginId}/chat`;

        WebSocketManager.replaceSubscribe(topic, (message) => {
            if (!message || !message.roomId) return;

            const roomMatch = parseInt(message.roomId) === parseInt(this.roomId);
            const notMine = String(message.senderId) !== String(this.userId);

            if (roomMatch && notMine) {
            this.messages.push(message);
            this.scrollToBottom();
            }
        });

            this.isSubscribed = true;
            console.log(`✅ 구독 완료: ${topic}`);
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

    disconnectWebSocket() {
        const topic = `/user/${this.senderLoginId}/chat`;
        console.log("🛑 disconnectWebSocket 호출됨 → topic:", topic);
        WebSocketManager.unsubscribe(topic);
        this.isSubscribed = false;
    },
}
}
</script>

<style>
.chat-box {
    height: 400px;
    overflow-y: auto;
    border: 1px solid #ddd;
    margin-bottom: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.chat-message {
    display: flex;
    flex-direction: column;
    max-width: 80%;
    word-wrap: break-word;
}

.sent {
    align-self: flex-end;
}

.received {
    align-self: flex-start;
}

.message-content {
    padding: 8px 12px;
    border-radius: 12px;
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 8px;
}

.sent .message-content {
    background-color: #e3f2fd;
    color: #1976d2;
    border-bottom-right-radius: 0;
}

.received .message-content {
    background-color: #f5f5f5;
    color: #333;
    border-bottom-left-radius: 0;
}

.sender-info {
    font-weight: bold;
    margin-bottom: 4px;
    font-size: 0.9rem;
}

.message-with-time {
    display: flex;
    align-items: flex-end;
    gap: 8px;
}

.message-text {
    margin: 4px 0;
    flex: 1;
}

.time {
    font-size: 0.75rem;
    color: #888;
    display: inline-block;
    white-space: nowrap;
}

/* 반응형 스타일 */
@media (max-width: 600px) {
    .chat-message {
        max-width: 90%;
    }
    
    .message-content {
        padding: 6px 10px;
    }
    
    .sender-info {
        font-size: 0.8rem;
    }
    
    .message-text {
        font-size: 0.9rem;
    }
}
</style>