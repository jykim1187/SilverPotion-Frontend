<template>
    <v-app-bar app dark>
        <v-container>
            <v-row align="center">
                <v-col class="d-flex justify-start">
                    <v-btn :to="{path:'/user-service/silverpotion/user/list'}">회원목록</v-btn>
                    <v-btn :to="{path:'/chat-service/chat/my/rooms'}">채팅방목록</v-btn>
                </v-col>
                <v-col class="text-center">
                    <v-btn :to="{path: '/'}">chat서비스</v-btn>
                </v-col>
                <v-col class="d-flex justify-end">
                    <v-btn v-if="!isLogin" :to="{path:'/user-service/silverpotion/user/create'}">회원가입</v-btn>
                    <v-btn v-if="!isLogin" :to="{path:'/user-service/silverpotion/user/login'}">로그인</v-btn>
                    <v-btn v-if="isLogin" @click="doLogout">로그아웃</v-btn>
                </v-col>
            </v-row>
        </v-container>
    </v-app-bar>
</template>


<script>
import emitter from '@/event-bus';

export default {
  data() {
    return {
      isLogin: false,
    };
  },
  created() {
    this.checkLogin();
    emitter.on('loginChanged', this.checkLogin);
  },
  beforeUnmount() {
    emitter.off('loginChanged', this.checkLogin);
  },
  methods: {
    checkLogin() {
      this.isLogin = !!localStorage.getItem('token');
    },
    doLogout() {
      localStorage.clear();
      emitter.emit('loginChanged');
      this.$router.push('/');
    },
  },
};
</script>