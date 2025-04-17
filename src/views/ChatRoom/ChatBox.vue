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
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';

export default {
    data() {
        return {
            messages: [],
            newMessage: "",
            stompClient: null,
            token: localStorage.getItem("token"),
            senderLoginId: localStorage.getItem("loginId"),
            userId: null,
            roomId: null
        }
    },
    async created() {
        this.roomId = this.$route.params.roomId;
        this.userId = Number(localStorage.getItem("userId"));
        this.messages = [];
        this.connectWebsocket();
    },
    beforeRouteLeave(to, from, next) {
        this.disconnectWebSocket();
        next();
    },
    beforeUnmount() {
        this.disconnectWebSocket();
    },
    methods: {
        connectWebsocket() {
            if(this.stompClient && this.stompClient.connected) return;
            
            const socket = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/chat-service/connect?loginId=${this.senderLoginId}`);
            this.stompClient = Stomp.over(socket);
            
            this.stompClient.connect(
                { Authorization: `Bearer ${this.token}`,
                    "X-User-LoginId": this.senderLoginId
                 },
                () => {
                    this.stompClient.subscribe(
                        `/sub/room/${this.roomId}`,
                        (message) => {
                            const parseMessage = JSON.parse(message.body);
                            this.messages.push(parseMessage);
                            this.scrollToBottom();
                        },
                        { Authorization: `Bearer ${this.token}`,
                            "X-User-LoginId": this.senderLoginId
                        }
                    );
                }
            );
        },
        sendMessage() {
            if(this.newMessage.trim() === "") return;
            
            this.stompClient.send(
                `/pub/room/${this.roomId}`,
                JSON.stringify({
                    roomId: this.roomId,
                    content: this.newMessage,
                    type: "TEXT"
                }),
                { 
                    Authorization: `Bearer ${this.token}`,
                    "X-User-LoginId": this.senderLoginId,
                    "X-User-Id": localStorage.getItem("userId")
                }
            );
            this.newMessage = "";
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const chatBox = this.$el.querySelector(".chat-box");
                chatBox.scrollTop = chatBox.scrollHeight;
            });
        },
        disconnectWebSocket() {
            if (this.stompClient && this.stompClient.connected) {
                this.stompClient.unsubscribe(`/sub/room/${this.roomId}`);
                this.stompClient.disconnect();
            }
        },
        formatTime(datetime) {
            if (!datetime) return '';
            const date = new Date(datetime);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }
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