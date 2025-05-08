<template>
  <v-app>
    <div class="app-wrapper">
      <div class="app-container">
        <div class="header-section">
          <HeaderComponent/>
        </div>
        <v-main class="main-section">
          <router-view/>
        </v-main>
      </div>
    </div>
  </v-app>
</template>

<script>
import WebSocketManager from './WebSocketManager'
import HeaderComponent from './components/HeaderComponent.vue'
import axios from 'axios'
import emitter from './event-bus'
import { useSse } from './composables/useSse.js'

export default {
  name: 'App',
  components: {
    HeaderComponent
  },
  data() {
    return {
      isWebSocketConnected: false,  // WebSocket 연결 상태를 관리
    };
  },
  mounted() {
    this.checkLoginStatus();
    const loginId = localStorage.getItem("loginId");
    if (loginId) {
      WebSocketManager.connect().then(() => {
        WebSocketManager.subscribe(`/user/${loginId}/chat`, (message) => {
          emitter.emit('newMessageReceived', message);
          emitter.emit('incrementNotificationBadge');
        });
      });
    }
  },
  beforeUnmount() {
    // 앱이 종료될 때 웹소켓 연결을 끊습니다.
    WebSocketManager.disconnect();
    // SSE 연결 해제
    if (this.disconnectSse) this.disconnectSse();
  },
  beforeRouteLeave(to, from, next) {
  WebSocketManager.disconnect();  // 페이지 이동 시 WebSocket 연결 해제
  next();
},
  methods: {
    async doLogout() {
    try {
      const loginId = localStorage.getItem("loginId");

      await axios.post(
        `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/logout`,
        {}, 
        { headers: { "X-User-LoginId": loginId } }
      );

      localStorage.clear();
      emitter.emit('loginChanged');  // 로그인 상태 변경 이벤트 발생
      this.$router.push('/');
      
      // 로그아웃 후 웹소켓 연결 종료
      this.disconnectWebSocket();

    } catch (error) {
      console.error('로그아웃 실패', error);
    }
  },
    async checkLoginStatus() {
      const loginId = localStorage.getItem("loginId");
      const token = localStorage.getItem("token");

      if (loginId && token) {
      await WebSocketManager.connect();  // WebSocket 연결 시도
      const { connectSse, disconnectSse } = useSse();
        connectSse(loginId); // 명시적 호출
        this.disconnectSse = disconnectSse;
    }
    },

    onNewMessage(message) {
      console.log('새로운 메시지:', message);
      // 메시지를 처리할 로직
      emitter.emit("newMessageReceived", { senderNickName: message.senderNickName, roomId: message.roomId, message });
    },
    disconnectWebSocket() {
      // WebSocket 연결 해제
      WebSocketManager.disconnect();
      this.isWebSocketConnected = false;
    }
  },

  
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #ffffff;
}

.app-wrapper {
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
}

.app-container {
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  background-color: #ffffff;
}

.header-section {
  width: 100%;
  position: relative;
  z-index: 1;
}

.main-section {
  width: 100%;
  position: relative;
  z-index: 0;
  margin-top: 56px; /* HeaderComponent의 높이만큼 마진 추가 */
}

.main-content {
  margin-top: 60px; /* HeaderComponent의 높이에 맞게 조정 */
  padding-left: 16px !important;
  padding-right: 16px !important;
}


@media (max-width: 768px) {
  .main-content {
    margin-top: 50px; /* 모바일에서의 간격 조정 */
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}

@media (min-width: 769px) {
  .app-container {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  }
}

.v-main {
  padding: 0 !important;
}
</style>