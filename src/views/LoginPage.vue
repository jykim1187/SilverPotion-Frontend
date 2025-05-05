<template>
    <v-container fluid class="fill-height pa-0 ma-0">
        <v-row align="center" justify="center" class="ma-0">
            <v-col cols="12" sm="10" md="8" lg="6" class="pa-0">
                <div class="login-container">
                    <div class="login-content">
                        <h1 class="welcome-text">실버포션</h1>
                        <p class="sub-text">안녕하세요!<br>실버포션에 오신 것을 환영합니다</p>
                        
                        <v-form @submit.prevent="doLogin" class="login-form">
                            <v-text-field
                                v-model="loginId"
                                label="아이디"
                                name="login"
                                prepend-inner-icon="mdi-account-outline"
                                type="text"
                                required
                                outlined
                                class="custom-input"
                                :rules="[v => !!v || '아이디를 입력해주세요']"
                            ></v-text-field>
                            
                            <v-text-field
                                v-model="password"
                                label="비밀번호"
                                name="password"
                                prepend-inner-icon="mdi-lock-outline"
                                type="password"
                                required
                                outlined
                                class="custom-input"
                                :rules="[v => !!v || '비밀번호를 입력해주세요']"
                            ></v-text-field>
                            
                            <v-btn
                                color="#8BBEE8"
                                @click="doLogin"
                                block
                                x-large
                                class="login-btn"
                                height="56"
                            >
                                로그인
                            </v-btn>
                        </v-form>
                        
                        <div class="divider">
                            <span>또는</span>
                        </div>
                        
                        <div class="social-login">
                            <v-btn
                                color="#F5D5CB"
                                class="social-btn"
                                @click="googleLogin"
                                x-large
                                height="56"
                            >
                                <v-img
                                    src="@/assets/google.png"
                                    max-height="24"
                                    max-width="24"
                                    class="mr-2"
                                ></v-img>
                                Google로 로그인
                            </v-btn>
                            
                            <v-btn
                                color="#F5D5CB"
                                class="social-btn"
                                @click="kakaoLogin"
                                x-large
                                height="56"
                            >
                                <v-img
                                    src="@/assets/kakao.png"
                                    max-height="24"
                                    max-width="24"
                                    class="mr-2"
                                ></v-img>
                                Kakao로 로그인
                            </v-btn>
                        </div>
                        
                        <div class="signup-link">
                            <span>계정이 없으신가요?</span>
                            <v-btn
                                text
                                color="#8BBEE8"
                                to="/user-service/silverpotion/user/create"
                                class="signup-btn"
                                x-large
                            >
                                회원가입
                            </v-btn>
                        </div>
                    </div>
                </div>
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
        console.log('Login Response:', response.data);
        
        const token = response.data.result.token;
        const refreshToken = response.data.result.refreshToken;
        const role = response.data.result.role;
        const adminRole = response.data.result.adminRole;

        // 저장
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("role", role);
        localStorage.setItem("adminRole", adminRole);
        localStorage.setItem("loginId", response.data.result.id);
        localStorage.setItem("userName", response.data.result.name);
        localStorage.setItem("nickName", response.data.result.nickName);
        localStorage.setItem("profileImage", response.data.result.profileImage);
        localStorage.setItem("userId", response.data.result.userId);

        // 저장된 값 확인
        console.log('Stored Token:', localStorage.getItem('token'));
        console.log('Stored Role:', localStorage.getItem('role'));
        console.log('Stored AdminRole:', localStorage.getItem('adminRole'));

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
    background: linear-gradient(135deg, #E8F4FF 0%, #FFF5F0 100%);
    padding: 0;
    margin: 0;
}

.login-container {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    padding: 40px 24px;
}

.login-content {
    width: 100%;
}

.welcome-text {
    font-size: 2.5rem;
    font-weight: 700;
    color: #4A6B8A;
    margin-bottom: 16px;
    text-align: center;
    font-family: 'Noto Sans KR', sans-serif;
}

.sub-text {
    font-size: 1.25rem;
    color: #666666;
    margin-bottom: 48px;
    text-align: center;
    font-family: 'Noto Sans KR', sans-serif;
    line-height: 1.6;
}

.login-form {
    margin-bottom: 32px;
}

.custom-input {
    border-radius: 12px !important;
    margin-bottom: 24px !important;
}

.custom-input :deep(.v-input__slot) {
    border-radius: 12px !important;
    background-color: #FFFFFF !important;
    border: 2px solid #E0E0E0 !important;
}

.custom-input :deep(.v-label) {
    font-size: 1.1rem !important;
    color: #666666 !important;
}

.custom-input :deep(input) {
    font-size: 1.2rem !important;
    padding: 12px 0 !important;
}

.login-btn {
    border-radius: 12px !important;
    font-weight: 600 !important;
    font-size: 1.2rem !important;
    color: white !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 8px rgba(139, 190, 232, 0.3) !important;
}

.login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(139, 190, 232, 0.4) !important;
}

.divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 32px 0;
    color: #666666;
    font-size: 1.1rem;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    border-bottom: 2px solid #E0E0E0;
}

.divider::before {
    margin-right: 16px;
}

.divider::after {
    margin-left: 16px;
}

.social-login {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
}

.social-btn {
    border-radius: 12px !important;
    font-weight: 500 !important;
    font-size: 1.1rem !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
    transition: all 0.3s ease !important;
    color: #666666 !important;
    box-shadow: 0 4px 8px rgba(245, 213, 203, 0.3) !important;
}

.social-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(245, 213, 203, 0.4) !important;
}

.signup-link {
    text-align: center;
    color: #666666;
    font-size: 1.1rem;
    font-family: 'Noto Sans KR', sans-serif;
}

.signup-btn {
    font-weight: 600 !important;
    font-size: 1.1rem !important;
    margin-left: 8px !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
}

@media (max-width: 600px) {
    .login-container {
        padding: 32px 16px;
    }
    
    .welcome-text {
        font-size: 2.2rem;
    }
    
    .sub-text {
        font-size: 1.1rem;
    }
    
    .custom-input :deep(input) {
        font-size: 1.1rem !important;
    }
    
    .login-btn, .social-btn {
        height: 52px !important;
        font-size: 1.1rem !important;
    }
}
</style>
