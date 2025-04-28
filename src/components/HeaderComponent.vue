<template>
    <v-app-bar dark elevation="1" height="56" class="header-app-bar">
        <div class="header-container">
            <v-row no-gutters align="center" justify="space-between" class="header-row">
                <v-col cols="4" class="d-flex align-center">
                    <v-btn :to="{path: '/'}" class="logo-btn" style="height: auto; background: transparent; box-shadow: none;">
                        <img src="@/assets/logo.png" alt="Silver Potion" style="height: 28px; width: auto;">
                    </v-btn>
                    
                    <!-- <v-btn :to="{path:'/silverpotion/user/list'}" variant="text" class="text-body-2 text-truncate ml-2">회원목록</v-btn> -->
                    
                    <v-btn 
                        v-if="isGatheringMainPage" 
                        icon 
                        class="ml-2" 
                        size="small"
                        :to="{path:'/silverpotion/gathering/opensearch'}"
                    >
                        <v-icon size="20">mdi-magnify</v-icon>
                    </v-btn>
                </v-col>
                
                <v-col cols="4" class="text-center d-flex align-center justify-center">
                </v-col>
                
                <v-col cols="4" class="d-flex align-center justify-end">
                    <div class="button-group">
                        <v-btn v-if="!isLogin" :to="{path:'/silverpotion/user/create'}" variant="text" class="text-body-2 text-truncate">회원가입</v-btn>
                        <v-btn v-if="!isLogin" :to="{path:'/silverpotion/user/login'}" variant="text" class="text-body-2 text-truncate">로그인</v-btn>
                        
                        <!-- <v-btn v-if="isLogin" :to="{path:'/chat-service/chat/my/rooms'}" icon class="ml-2" size="small">
                            <v-icon size="20">mdi-message-outline</v-icon>
                        </v-btn> -->
                        
                        <v-btn v-if="isLogin" icon class="ml-2" color="grey-darken-3" size="small" variant="text" @click="toggleNotificationsMenu">
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
                        
                        <v-menu v-if="isLogin" v-model="profileMenu" :close-on-content-click="false" location="bottom end" min-width="200">
                            <template v-slot:activator="{ props }">
                                <v-btn class="ml-2" icon v-bind="props">
                                    <v-avatar size="45">
                                        <img :src="profileImage || require('@/assets/default-profile.png')" alt="프로필"
                                        style="object-fit: cover; width: 100%; height: 100%;" >
                                    </v-avatar>
                                </v-btn>
                            </template>
                            <v-card>
                                <v-list>
                                    <v-list-item>
                                        <v-list-item-title>
                                            <v-btn :to="{path:'/silverpotion/mypage'}" variant="text" block class="justify-start">
                                                <v-icon start>mdi-account</v-icon> 마이페이지
                                            </v-btn>
                                        </v-list-item-title>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>
                                            <v-btn :to="{path:'/chat-service/chat/my/rooms'}" variant="text" block class="justify-start">
                                                <v-icon start>mdi-chat</v-icon> 채팅목록
                                            </v-btn>
                                        </v-list-item-title>
                                    </v-list-item>
                                    <v-divider></v-divider>
                                    <v-list-item>
                                        <v-list-item-title>
                                            <v-btn @click="doLogout" variant="text" block class="justify-start">
                                                <v-icon start>mdi-logout</v-icon> 로그아웃
                                            </v-btn>
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-card>
                        </v-menu>
                    </div>
                </v-col>
            </v-row>
        </div>
        
        <v-navigation-drawer v-model="notificationsMenu" location="right" temporary width="300" class="notifications-drawer">
            <v-toolbar title="알림" flat>
                <v-spacer></v-spacer>
                <v-btn icon @click="notificationsMenu = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-divider></v-divider>
            <v-list v-if="notifications.length > 0">
                <v-list-item v-for="(notification, index) in notifications" :key="index" :title="notification.title" :subtitle="notification.message"></v-list-item>
            </v-list>
            <v-list v-else>
                <v-list-item title="알림이 없습니다"></v-list-item>
            </v-list>
        </v-navigation-drawer>
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
      profileMenu: false,
      notificationsMenu: false,
      profileImage: null,
      notifications: [],
    };
  },
  computed: {
    isGatheringMainPage() {
      return this.$route.path === '/silverpotion/gathering/main';
    }
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
      if (this.isLogin) {
        this.fetchUserProfile();
      }
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
        this.profileMenu = false;
      }
      catch(error){
        console.error('로그아웃 실패', error);
      }
    },
    checkNotifications() {
      this.hasNotifications = true;
      
      this.notifications = [
        { title: '새로운 메시지', message: '새 메시지가 도착했습니다.' },
        { title: '모임 알림', message: '내일 모임이 예정되어 있습니다.' }
      ];
    },
    async fetchUserProfile() {
       const loginId = localStorage.getItem("loginId");
       console.log("fetchUserProfile 실행");
       const UserImgReqDto = {  
        loginId: loginId
       }
      
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/whatisyourpicture`, UserImgReqDto);
        console.log(response.data);
        this.profileImage = response.data.result;
    },
    toggleNotificationsMenu() {
      this.notificationsMenu = !this.notificationsMenu;
    }
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

.notifications-drawer {
    max-width: 100%;
    border-radius: 0;
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