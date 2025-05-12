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
      disconnectSse: null,
    };
  },
  async mounted() {
    emitter.on('loginChanged', this.checkLoginStatus); // 로그인 상태 감지
    this.checkLoginStatus(); // 새로고침 대응
  },
  beforeUnmount() {
    WebSocketManager.disconnect();
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
      this.disconnectWebSocket();
      this.$router.push('/');
    } catch (error) {
      console.error('로그아웃 실패', error);
    }
  },
    async checkLoginStatus() {
      const loginId = localStorage.getItem("loginId");
      const token = localStorage.getItem("token");
      console.log("🟡 로그인 상태 확인 중:", { loginId, token });

      if (!loginId || !token || this.isWebSocketConnected) return;

      try {
        await WebSocketManager.connect();
        console.log("🟢 WebSocket 연결 성공, 구독 시도");   

        // ✅ WebSocket 구독
        WebSocketManager.subscribe(`/user/${loginId}/chat`, (message) => {
          console.log("💬 수신된 메시지:", message);
          emitter.emit('newMessageReceived', message);
          emitter.emit('incrementNotificationBadge');
        });

        // ✅ SSE 연결
        const { connectSse, disconnectSse } = useSse();
        connectSse(loginId);
        this.disconnectSse = disconnectSse;

        this.isWebSocketConnected = true;
        console.log("✅ 실시간 연결 및 구독 완료");
      } catch (e) {
        console.error('❌ 실시간 연결 실패:', e);
      }
    },

    onNewMessage(message) {
      console.log('새로운 메시지:', message);
      // 메시지를 처리할 로직
      emitter.emit("newMessageReceived", { senderNickName: message.senderNickName, roomId: message.roomId, message });
    },
    disconnectWebSocket() {
      WebSocketManager.disconnect();
      this.disconnectSse?.();
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
  flex: 1;
  overflow-y: auto;
  padding-bottom: 2rem;
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

#app {
  min-height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
</style>