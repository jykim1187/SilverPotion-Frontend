<template>
    <v-container fluid class="fill-height pa-0 ma-0" style="max-width: 1080px; margin: 0 auto;">
        <v-row align="center" justify="center">
            <v-col cols="12" sm="11" md="9" lg="7">
                <v-card class="elevation-0 pa-0">
                   <!-- 로고 -->
                    <v-card-text class="text-center pa-0">
                      
                        <img src="@/assets/logo.png" alt="Logo" class="logo mb-8" style="height: 60px;">
                        <!-- 로그인 폼 -->
                        <v-form @submit.prevent="doLogin" class="px-4">
                           <!-- 로그인 ID 입력 필드 -->
                            <v-text-field
                                v-model="loginId"
                                label="로그인 ID"
                                name="login"
                                prepend-inner-icon="mdi-account-outline"
                                type="text"
                                required
                                outlined
                                class="mb-4"
                                :rules="[v => !!v || '로그인 ID를 입력해주세요']"
                            ></v-text-field>
                          <!-- 비밀번호 입력 필드 -->
                            <v-text-field
                                v-model="password"
                                label="비밀번호"
                                name="password"
                                prepend-inner-icon="mdi-lock-outline"
                                type="password"
                                required
                                outlined
                                :rules="[v => !!v || '비밀번호를 입력해주세요']"
                            ></v-text-field>
                          <!-- 로그인 버튼 -->
                            <v-btn
                                color="#FF6B00"
                                @click="doLogin"
                                block
                                large
                                class="mb-4 white--text"
                                height="48"
                            >
                                로그인
                            </v-btn>
                        </v-form>
                    </v-card-text>
                    <v-divider class="my-4"></v-divider>
                    <!-- 소셜 로그인 버튼 -->
                    <v-card-actions class="justify-center px-4">
                        <v-row>
                            <v-col cols="6" class="text-center">
                              <!-- 구글 로그인 버튼 -->
                                <v-btn
                                    color="#4285F4"
                                    class="white--text"
                                    block
                                    @click="googleLogin"
                                >
                                    <v-img
                                        src="@/assets/google.png"
                                        max-height="24"
                                        max-width="24"
                                        class="mr-2"
                                    ></v-img>
                                    Google
                                </v-btn>
                            </v-col>
                            <v-col cols="6" class="text-center">
                              <!-- 카카오 로그인 버튼 -->
                                <v-btn
                                    color="#FEE500"
                                    block
                                    @click="kakaoLogin"
                                >
                                    <v-img
                                        src="@/assets/kakao.png"
                                        max-height="24"
                                        max-width="24"
                                        class="mr-2"
                                    ></v-img>
                                    Kakao
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-actions>
                    <!-- 회원가입 버튼 -->
                    <v-card-actions class="justify-center mt-4">
                        <v-btn text color="grey darken-1" to="/user-service/silverpotion/user/create">
                            회원가입
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios'
import emitter from '@/event-bus';
import WebSocketManager from '@/WebSocketManager';
// import { jwtDecode } from 'jwt-decode'

export default {
  data() {
    return {
      loginId: "",
      password: "",
      userName: "",
      googleUrl: "https://accounts.google.com/o/oauth2/auth",
      googleClientId: "73727762121-skf00kqrlnfjput7t493mmdifss29170.apps.googleusercontent.com",
      googleRedirectUri: "http://localhost:3000/oauth/google/redirect",
      googleScope: "openid email profile",
      googleResponseType: "code",
      kakaoUrl: "https://kauth.kakao.com/oauth/authorize",
      kakaoClientId: "740a1fc6969a1fc6c821d81a2236d3fe",
      kakaoRedirectUri: "http://localhost:3000/oauth/kakao/redirect",
    }
  },
  methods: {
    
     // 일반 로그인
    async doLogin() {
      try {
        const loginData = {
          loginId: this.loginId,
          password: this.password,
        }

        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/login`,
          loginData
        )
        console.log(response)
        const token = response.data.result.token
        const refreshToken = response.data.result.refreshToken

        // 저장
        localStorage.setItem("token", token)
        localStorage.setItem("refreshToken", refreshToken)
        // 디코딩해서 로그인 ID와 권한 추출 (선택)
        // const role = jwtDecode(token).role
        // const loginId = jwtDecode(token).sub
        localStorage.setItem("role", response.data.result.role)
        localStorage.setItem("loginId", response.data.result.id)
        localStorage.setItem("userName", response.data.result.name)
        localStorage.setItem("nickName", response.data.result.nickName)
        localStorage.setItem("profileImage", response.data.result.profileImage)
        localStorage.setItem("userId", response.data.result.userId)
        // 리디렉션
        console.log("Login 성공! now routing to /");
        WebSocketManager.token = token;
        WebSocketManager.loginId = response.data.result.id;
        WebSocketManager.connect();
        emitter.emit('loginChanged');
        this.$router.push('/');
      } catch (error) {
        alert('로그인 실패! 아이디 또는 비밀번호를 확인하세요.')
        console.error('로그인 에러:', error)
      }
    },
    googleLogin(){
      const auth_uri = `${this.googleUrl}?client_id=${this.googleClientId}&redirect_uri=${this.googleRedirectUri}&response_type=code&scope=${this.googleScope}&access_type=offline&prompt=consent`;
      window.location.href = auth_uri;
    },
    kakaoLogin(){
      const auth_url = `${this.kakaoUrl}?client_id=${this.kakaoClientId}&redirect_uri=${this.kakaoRedirectUri}&response_type=code`;
      window.location.href = auth_url;
    }

  }
}
</script>

<style scoped>
.fill-height {
    min-height: 100vh;
    background-color: #f8f8f8;
    padding: 0;
    margin: 0;
}

@media (max-width: 1080px) {
    .fill-height {
        padding: 0 16px;
    }
}

.logo {
    margin-top: 40px;
}

.v-text-field {
    border-radius: 4px;
}

.v-btn {
    text-transform: none;
    font-weight: 500;
    letter-spacing: 0;
}

.v-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
