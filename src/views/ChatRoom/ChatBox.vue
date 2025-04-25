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
                             :class="['chat-message', msg.senderId === userId ? 'sent' : 'received' ]"
                            >
                            <template v-if="msg.senderId === userId">
                                <div class="message-content">
                                    {{ msg.content }}
                                    <span class="time" v-if="msg.createdAt">{{ formatTime(msg.createdAt) }}</span>
                                </div>
                            </template>
                            <template v-else>
                                <div class="message-content">
                                    {{ msg.content }}
                                    <span class="time" v-if="msg.createdAt">{{ formatTime(msg.createdAt) }}</span>
                                </div>
                            </template>
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
            isSending: false, // ✅ 중복 방지용
        }
    },
    async created() {
        console.log("🔥 채팅방 created() 실행됨");
        this.roomId = this.$route.params.roomId;
        this.userId = localStorage.getItem("userId");
        this.messages = [];
        this.connectWebsocket();
    },
    beforeRouteLeave(to, from, next) {
        // this.disconnectWebSocket();
        next();
    },
    beforeUnmount() {
        this.disconnectWebSocket();
    },
    methods: {
        connectWebsocket() {
            console.log("🔧 connectWebsocket 호출됨, 현재 isSubscribed =", this.isSubscribed);
            if (this.isSubscribed){
                console.warn("🚫 이미 구독되어 있어서 connect 중단됨");
                return;
            }
            const loginId = localStorage.getItem("loginId");
            const topic = `/user/${loginId}/chat`;

            console.log("📡 replaceSubscribe 호출 예정 topic:", topic);

            WebSocketManager.replaceSubscribe(topic, (message) => {
                console.log('📨 ChatRoom용 메시지 수신:', message);
                console.log('📨 Message details:', {
                    roomId: message.roomId,
                    currentRoomId: this.roomId,
                    content: message.content,
                    senderId: message.senderId,
                    currentUserId: this.userId
                });
                console.log("🧩 현재 roomId:", this.roomId, typeof this.roomId);
                console.log("🧩 수신된 message.roomId:", message.roomId, typeof message.roomId);
                if (!message) {
                    console.warn("❌ message is undefined/null");
                    return;
                }
                
                if (!message.roomId) {
                    console.warn("⚠️ message.roomId 없음, 전체 메시지:", message);
                    return;
                }
                
                if (parseInt(message.roomId) === parseInt(this.roomId)) {
                    // 내가 방금 보낸 메시지라면 무시 (로컬에서 이미 push 했음)
                    if (String(message.senderId) === String(this.userId)) {
                        console.log("🙅 내 메시지는 수신에서 무시함");
                        return;
                    }
                    console.log('✅ 현재 방 메시지 수신, 메시지 추가');
                    this.messages.push(message);
                    this.scrollToBottom();
                } else {
                    console.log('📪 다른 방 메시지:', message.roomId, '현재 방:', this.roomId);
                }
            });
            
            this.isSubscribed = true;
        },
        sendMessage() {
            if(this.newMessage.trim() === "") return;
            this.isSending = true; // ✅ 전송 중 플래그 설정

            const message = {
                roomId: this.roomId,
                content: this.newMessage,
                type: "TEXT",
                senderId: this.userId,
                createdAt: new Date().toISOString()
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
            
            this.newMessage = "";
            setTimeout(() => {
                this.isSending = false; // ✅ 잠깐 후에 초기화
            }, 300); // debounce 효과
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