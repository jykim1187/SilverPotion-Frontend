<template>
    <v-app-bar dark elevation="1" height="56" class="header-app-bar">
        <div class="header-container">
            <v-row no-gutters align="center" justify="space-between" class="header-row">
                <v-col cols="4" class="d-flex align-center">
                    <v-btn :to="{path:'/silverpotion/user/list'}" variant="text" class="text-body-2 text-truncate">회원목록</v-btn>
                </v-col>
                <v-col cols="4" class="text-center d-flex align-center justify-center">
                    <v-btn :to="{path: '/'}" class="logo-btn" style="height: auto; background: transparent; box-shadow: none;">
                        <img src="@/assets/logo.png" alt="Silver Potion" style="height: 32px; width: auto;">
                    </v-btn>
                </v-col>
                <v-col cols="4" class="d-flex align-center justify-end">
                    <div class="button-group">
                        <v-btn v-if="isLogin" :to="{path:'/chat-service/chat/my/rooms'}" icon class="ml-2" size="small">
                            <v-icon size="20">mdi-message-outline</v-icon>
                        </v-btn>
                        <v-btn v-if="isLogin" icon class="ml-2" color="grey-darken-3" size="small" variant="text">
                            <v-icon size="24">mdi-bell-ring-outline</v-icon>
                            <v-badge
                                v-if="hasNotifications"
                                color="error"
                                dot
                                location="bottom end"
                                offset-x="3"
                                offset-y="3"
                            ></v-badge>
                        </v-btn>
                        <v-btn v-if="!isLogin" :to="{path:'/silverpotion/user/create'}" variant="text" class="text-body-2 text-truncate">회원가입</v-btn>
                        <v-btn v-if="!isLogin" :to="{path:'/silverpotion/user/login'}" variant="text" class="text-body-2 text-truncate">로그인</v-btn>
                        <v-btn v-if="isLogin" @click="doLogout" variant="text" class="text-body-2 text-truncate">로그아웃</v-btn>
                    </div>
                </v-col>
            </v-row>
        </div>
    </v-app-bar>
</template>


<script>
import emitter from '@/event-bus';
import axios from 'axios';

export default {
  data() {
    return {
      isLogin: false,
      hasNotifications: false,
    };
  },
  created() {
    this.checkLogin();
    emitter.on('loginChanged', this.checkLogin);
    this.checkNotifications();
  },
  beforeUnmount() {
    emitter.off('loginChanged', this.checkLogin);
  },
  methods: {
    checkLogin() {
      this.isLogin = !!localStorage.getItem('token');
    },
    async doLogout() {
      try{
        const loginId = localStorage.getItem("loginId");

        await axios.post(
        `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/logout`,
        {}, // body 없음
        { headers: { "X-User-LoginId": loginId } }
        );

        localStorage.clear();
        emitter.emit('loginChanged');
        this.$router.push('/');
            }
            catch(error){
              console.error('로그아웃 실패', error);
            }
    },
    checkNotifications() {
      this.hasNotifications = true;
    },
  },
};
</script>

<style scoped>
.header-app-bar {
    width: 100%;
    max-width: 768px;
    margin: 0 auto;
    left: 50% !important;
    transform: translateX(-50%) !important;
    position: fixed;
}

.header-container {
    width: 100%;
    padding: 0 16px;
    overflow: hidden;
}

.header-row {
    width: 100%;
    margin: 0;
}

.button-group {
    display: flex;
    align-items: center;
    overflow: hidden;
}

.text-truncate {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 768px) {
    .header-content {
        padding: 0 8px;
    }
    
    .v-btn {
        min-width: 0;
        padding: 0 8px;
    }
}
</style>