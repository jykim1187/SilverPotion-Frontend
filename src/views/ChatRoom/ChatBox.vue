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
                             :class="['chat-message', msg.senderLoginId ===this.senderLoginId ? 'sent' : 'received' ]"
                            >
                            <strong>{{ msg.senderLoginId }}: </strong> {{ msg.message }}
                            <span class="time" v-if="msg.createdTime"> / {{ formatTime(msg.createdTime) }}</span>
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
import axios from 'axios';

export default{
    data(){
        return {
            messages: [],
            newMessage: "",
            stompClient: null,
            token: "",
            senderLoginId: null,
            roomId: null,
            loginId:null,
            createdTime:null,
        }
    },
    async created(){
        this.senderLoginId = localStorage.getItem("loginId");
        this.roomId = this.$route.params.roomId;
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/history/${this.roomId}`);
        console.log(response);
        this.messages = response.data;
        this.$nextTick(() => {
        this.scrollToBottom();
        });
        this.connectWebsocket();
    },
    // 사용자가 현재 라우트에서 다른 라우트로 이동하려고 할때 호출되는 훅함수
    beforeRouteLeave(to, from, next) {
        this.disconnectWebSocket();
        next();
    },
    // 화면을 완전히 꺼버렸을때
    beforeUnmount() {
        this.disconnectWebSocket();
    },
    methods: {
        connectWebsocket(){
            if(this.stompClient && this.stompClient.connected) return;
            // sockjs는 websocket을 내장한 향상된 js 라이브러리. http엔드포인트 사용.
            // url 전부 다들어가야함 chat-service/ ... 
            
            const loginId = localStorage.getItem("loginId");
            const socket = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/chat-service/connect?loginId=${loginId}`);
            this.stompClient = Stomp.over(socket);
            this.token = localStorage.getItem("token");
            this.stompClient.connect({
                Authorization: `Bearer ${this.token}`
            },
                ()=>{
                    //연결 맺어진상태라 앞에부분은 떼어 들어가도됌됌
                    console.log("stompClient.connect ✅ 연결 성공");
                    this.stompClient.subscribe(`/topic/${this.roomId}`, (message) => {
                        const parseMessage = JSON.parse(message.body);
                        this.messages.push(parseMessage);
                        this.scrollToBottom();
                    },{Authorization: `Bearer ${this.token}`})
                }
            )
        },
        sendMessage(){
            if(this.newMessage.trim() === "")return;
            const now = new Date().toISOString();
            const message = {
                roomId: this.$route.params.roomId ,
                senderLoginId: this.senderLoginId,
                message: this.newMessage,
                createdTime: now,
            }
            this.stompClient.send(`/publish/${this.roomId}`, JSON.stringify(message));
            this.newMessage = ""
        },
        scrollToBottom(){
            this.$nextTick(()=>{
                const chatBox = this.$el.querySelector(".chat-box");
                chatBox.scrollTop = chatBox.scrollHeight;
            })
        },
        async disconnectWebSocket() {
            try {
                await axios.post(
                `${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/room/${this.roomId}/read`,
                {},
                    {
                    headers: {
                    Authorization: `Bearer ${this.token}`,
                    'X-User-LoginId': this.senderLoginId
                    }
                });
            } catch (e) {
                console.error("❌ 읽음 처리 실패:", e);
            }

            if (this.stompClient && this.stompClient.connected) {
                this.stompClient.unsubscribe(`/topic/${this.roomId}`);
                this.stompClient.disconnect();
            }
        },
        //시간 hh:mm 형식으로 포맷팅
        formatTime(datetime) {
            if (!datetime) return '';
            const date = new Date(datetime);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`; // hh:mm 형식
        },
    },
}
</script>
<style>
.chat-box{
    height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    margin-bottom: 10px;
}

.chat-message{
    margin-bottom:10px;
}
.sent{
    text-align:right;
}
.received{
    text-align:left;
}
.time {
    font-size: 0.75rem;
    color: #888;
    margin-left: 4px;
}
</style>