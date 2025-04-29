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

export default {
  name: 'App',
  components: {
    HeaderComponent
  },
  mounted() {
    this.checkLoginStatus();  // 앱이 마운트되면 로그인 상태를 체크하고 웹소켓 연결
  },
  beforeUnmount() {
  // 앱이 종료될 때 웹소켓 연결을 끊습니다.
  WebSocketManager.disconnect();
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
      WebSocketManager.disconnect();

    } catch (error) {
      console.error('로그아웃 실패', error);
    }
  },
    checkLoginStatus() {
      const loginId = localStorage.getItem("loginId");
      const token = localStorage.getItem("token");

      if (loginId && token) {
        // 로그인 상태일 때만 웹소켓 연결
        WebSocketManager.token = token;
        WebSocketManager.connect()
          .then(() => {
            // 연결이 성공하면, 채팅 유저 채널 구독
            WebSocketManager.subscribe(`/user/${loginId}/chat`, this.onNewMessage);
          })
          .catch((error) => {
            console.error("웹소켓 연결 실패:", error);
          });
      }
    },

    onNewMessage(message) {
      console.log('새로운 메시지:', message);
      // 메시지를 처리할 로직
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